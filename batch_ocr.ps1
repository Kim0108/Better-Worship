Add-Type -AssemblyName System.Runtime.WindowsRuntime

$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.IsGenericMethod -and $_.GetParameters().Count -eq 1
} | Select-Object -First 1

function Invoke-WinRTAsync($op, $type) {
    $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
    $task.Wait()
    return $task.Result
}

[Windows.Storage.Streams.InMemoryRandomAccessStream, Windows.Storage.Streams, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Globalization.Language, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null

$lang = New-Object Windows.Globalization.Language("zh-Hant-TW")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)
if ($null -eq $engine) {
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
}

$results = [System.Collections.ArrayList]::new()
$sw = [System.Diagnostics.Stopwatch]::StartNew()

for ($p = 1; $p -le 219; $p++) {
    $filePath = (Resolve-Path "assets\pages\page_$p.jpg").Path
    $bytes = [System.IO.File]::ReadAllBytes($filePath)
    
    $memStream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
    $writer = New-Object Windows.Storage.Streams.DataWriter($memStream)
    $writer.WriteBytes($bytes)
    $null = Invoke-WinRTAsync ($writer.StoreAsync()) ([System.UInt32])
    $null = Invoke-WinRTAsync ($writer.FlushAsync()) ([System.Boolean])
    $memStream.Seek(0)
    
    $decoder = Invoke-WinRTAsync ([Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($memStream)) ([Windows.Graphics.Imaging.BitmapDecoder])
    $bitmap = Invoke-WinRTAsync ($decoder.GetSoftwareBitmapAsync()) ([Windows.Graphics.Imaging.SoftwareBitmap])
    
    $ocrResult = Invoke-WinRTAsync ($engine.RecognizeAsync($bitmap)) ([Windows.Media.Ocr.OcrResult])
    
    # Process text: combine lines and clean up excessive spaces between CJK characters
    $lines = @()
    foreach ($line in $ocrResult.Lines) {
        $lines += $line.Text
    }
    $rawText = $lines -join "`n"
    
    $item = [PSCustomObject]@{
        page = $p
        text = $rawText
    }
    $null = $results.Add($item)
    
    if ($p % 25 -eq 0 -or $p -eq 219) {
        [Console]::OutputEncoding = [System.Text.Encoding]::UTF8
        Write-Host "Processed page $p / 219 in $($sw.Elapsed.TotalSeconds.ToString('F1'))s"
    }
    
    $memStream.Dispose()
    $writer.Dispose()
}

$json = $results | ConvertTo-Json -Depth 5
[System.IO.File]::WriteAllText("assets/ocr_raw.json", $json, [System.Text.Encoding]::UTF8)
Write-Host "All 219 pages OCR completed in $($sw.Elapsed.TotalSeconds.ToString('F1'))s. Saved to assets/ocr_raw.json"
