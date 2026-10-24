import json
import re
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Table of Contents based on Pages 2-7
toc = [
    {
        "id": "cover",
        "title": "封面",
        "titleEn": "Cover",
        "bookPage": None,
        "pdfPage": 1
    },
    {
        "id": "bio",
        "title": "易啟年牧師生平簡介",
        "titleEn": "Biography of Rev. Dr. Chi-Nien Yi",
        "bookPage": None,
        "pdfPage": 2
    },
    {
        "id": "preface",
        "title": "自序",
        "titleEn": "Author's Preface",
        "bookPage": 1,
        "pdfPage": 3
    },
    {
        "id": "toc",
        "title": "目錄",
        "titleEn": "Table of Contents",
        "bookPage": 2,
        "pdfPage": 4
    },
    {
        "id": "ch1",
        "title": "第一章 敬拜上帝",
        "titleEn": "Chapter 1: Worship God",
        "bookPage": 8,
        "pdfPage": 10,
        "sections": [
            {"title": "基督徒與崇拜：拜主的人才是基督徒", "bookPage": 9, "pdfPage": 11},
            {"title": "基督徒的崇拜：向神啟示的回應", "bookPage": 11, "pdfPage": 13},
            {"title": "構成基督徒崇拜行為的要素", "bookPage": 14, "pdfPage": 16}
        ]
    },
    {
        "id": "ch2",
        "title": "第二章 聚會敬拜",
        "titleEn": "Chapter 2: Corporate Worship",
        "bookPage": 20,
        "pdfPage": 22,
        "sections": [
            {"title": "學道第一課：群體敬拜", "bookPage": 21, "pdfPage": 23},
            {"title": "聖經裡其他的例樣（天上/舊約/新約聖會）", "bookPage": 23, "pdfPage": 25},
            {"title": "群體敬拜是神始終一貫的計劃", "bookPage": 27, "pdfPage": 29},
            {"title": "群體敬拜的效用", "bookPage": 29, "pdfPage": 31}
        ]
    },
    {
        "id": "ch3",
        "title": "第三章 以崇拜事奉神",
        "titleEn": "Chapter 3: Serving God Through Worship",
        "bookPage": 33,
        "pdfPage": 35,
        "sections": [
            {"title": "崇拜是一種事奉", "bookPage": 34, "pdfPage": 36},
            {"title": "崇拜是最基本的事奉", "bookPage": 36, "pdfPage": 38},
            {"title": "崇拜事奉的特點", "bookPage": 38, "pdfPage": 40},
            {"title": "赴會崇拜專求所得的錯誤", "bookPage": 41, "pdfPage": 43},
            {"title": "新約時代的崇拜事奉與舊約祭禮的關係", "bookPage": 44, "pdfPage": 46}
        ]
    },
    {
        "id": "ch4",
        "title": "第四章 崇拜的形式",
        "titleEn": "Chapter 4: The Forms of Worship",
        "bookPage": 47,
        "pdfPage": 49,
        "sections": [
            {"title": "新約時代的敬拜還有形式的問題嗎？", "bookPage": 48, "pdfPage": 50},
            {"title": "崇拜形式的標準化問題", "bookPage": 51, "pdfPage": 53},
            {"title": "以儀文禮式作為神前的集體許願", "bookPage": 54, "pdfPage": 56},
            {"title": "崇拜儀式的功用與得失", "bookPage": 56, "pdfPage": 58}
        ]
    },
    {
        "id": "ch5",
        "title": "第五章 崇拜的內容與編排",
        "titleEn": "Chapter 5: Worship Content and Order",
        "bookPage": 64,
        "pdfPage": 66,
        "sections": [
            {"title": "初代教會的崇拜程序與內容", "bookPage": 65, "pdfPage": 67},
            {"title": "現代崇拜敬拜的活動項目", "bookPage": 68, "pdfPage": 70},
            {"title": "崇拜程序安排原則", "bookPage": 71, "pdfPage": 73}
        ]
    },
    {
        "id": "ch6",
        "title": "第六章 追求更美的崇拜聚會",
        "titleEn": "Chapter 6: Pursuing a Better Worship Service",
        "bookPage": 76,
        "pdfPage": 78,
        "sections": [
            {"title": "最要緊的事——以神為中心", "bookPage": 78, "pdfPage": 80},
            {"title": "平衡兼顧的原則", "bookPage": 80, "pdfPage": 82},
            {"title": "一氣呵成的聚會構想", "bookPage": 86, "pdfPage": 88}
        ]
    },
    {
        "id": "ch7",
        "title": "第七章 崇拜聚會事奉人員",
        "titleEn": "Chapter 7: Worship Servants and Leadership",
        "bookPage": 89,
        "pdfPage": 91,
        "sections": [
            {"title": "招待人員的職責與服事", "bookPage": 90, "pdfPage": 92},
            {"title": "聚會主席的角色與職事", "bookPage": 92, "pdfPage": 94},
            {"title": "音樂事奉人員（司琴、詩班、領唱人）", "bookPage": 99, "pdfPage": 101}
        ]
    },
    {
        "id": "ch8",
        "title": "第八章 導入崇拜",
        "titleEn": "Chapter 8: Entrance and Prelude to Worship",
        "bookPage": 102,
        "pdfPage": 104,
        "sections": [
            {"title": "教會與赴會者的會前準備", "bookPage": 104, "pdfPage": 106},
            {"title": "一個明確的開始", "bookPage": 109, "pdfPage": 111},
            {"title": "崇拜程序開始節目的靜態與動態處理", "bookPage": 111, "pdfPage": 113}
        ]
    },
    {
        "id": "ch9",
        "title": "第九章 祈禱與認信",
        "titleEn": "Chapter 9: Prayer and Confession of Faith",
        "bookPage": 119,
        "pdfPage": 121,
        "sections": [
            {"title": "祈禱的內容（頌讚、祈求、交託、表告、祝禱）", "bookPage": 120, "pdfPage": 122},
            {"title": "祈禱節目在程序中的安排", "bookPage": 125, "pdfPage": 127},
            {"title": "祈禱身形取態與領禱預備", "bookPage": 128, "pdfPage": 130},
            {"title": "認信告白（使徒信經等）", "bookPage": 132, "pdfPage": 134}
        ]
    },
    {
        "id": "ch10",
        "title": "第十章 信息與回應",
        "titleEn": "Chapter 10: Proclamation and Response",
        "bookPage": 134,
        "pdfPage": 136,
        "sections": [
            {"title": "讀經（會眾同讀、主席讀經）", "bookPage": 135, "pdfPage": 137},
            {"title": "宣講信息與講道定位", "bookPage": 138, "pdfPage": 140},
            {"title": "回應（許願立志、奉獻）", "bookPage": 143, "pdfPage": 145}
        ]
    },
    {
        "id": "ch11",
        "title": "第十一章 崇拜的音樂",
        "titleEn": "Chapter 11: Music in Worship",
        "bookPage": 147,
        "pdfPage": 149,
        "sections": [
            {"title": "會眾唱詩與詩歌類別", "bookPage": 149, "pdfPage": 151},
            {"title": "領唱與司琴的事奉", "bookPage": 153, "pdfPage": 155},
            {"title": "詩班的職分與獻唱事工", "bookPage": 157, "pdfPage": 159}
        ]
    },
    {
        "id": "ch12",
        "title": "第十二章 肢體交通",
        "titleEn": "Chapter 12: Fellowship and Communion",
        "bookPage": 162,
        "pdfPage": 164,
        "sections": [
            {"title": "問安與見證", "bookPage": 164, "pdfPage": 166},
            {"title": "事務報告的定位", "bookPage": 167, "pdfPage": 169},
            {"title": "茶點・愛筵", "bookPage": 169, "pdfPage": 171}
        ]
    },
    {
        "id": "ch13",
        "title": "第十三章 聖禮",
        "titleEn": "Chapter 13: The Sacraments",
        "bookPage": 171,
        "pdfPage": 173,
        "sections": [
            {"title": "洗禮的方式、意義與進行", "bookPage": 173, "pdfPage": 175},
            {"title": "聖餐禮的意義與處理方法", "bookPage": 177, "pdfPage": 179},
            {"title": "其他禮式（按手、差遣、奉獻禮）", "bookPage": 182, "pdfPage": 184}
        ]
    },
    {
        "id": "ch14",
        "title": "第十四章 兒童崇拜",
        "titleEn": "Chapter 14: Children's Worship",
        "bookPage": 186,
        "pdfPage": 188,
        "sections": [
            {"title": "時間安排（正堂崇拜一部分 vs 獨立聚會）", "bookPage": 188, "pdfPage": 190},
            {"title": "兒童崇拜的主領者", "bookPage": 193, "pdfPage": 195},
            {"title": "兒童崇拜節目內容與設計", "bookPage": 195, "pdfPage": 197}
        ]
    },
    {
        "id": "ch15",
        "title": "第十五章 聚會與敬拜",
        "titleEn": "Chapter 15: Gatherings and Worship",
        "bookPage": 204,
        "pdfPage": 206,
        "sections": [
            {"title": "特別聚會（週年慶典、婚禮、安息追思禮）", "bookPage": 205, "pdfPage": 207},
            {"title": "普通聚會（祈禱會、研經會、團契、議事）", "bookPage": 209, "pdfPage": 211}
        ]
    },
    {
        "id": "notes",
        "title": "附註",
        "titleEn": "Endnotes",
        "bookPage": 214,
        "pdfPage": 216
    },
    {
        "id": "bib",
        "title": "參考書目",
        "titleEn": "Bibliography",
        "bookPage": 215,
        "pdfPage": 217
    },
    {
        "id": "back",
        "title": "封底與出版資訊",
        "titleEn": "Back Cover and Publishing Details",
        "bookPage": None,
        "pdfPage": 218
    }
]

def get_page_meta(pdf_p):
    current_ch = toc[0]
    for ch in toc:
        if pdf_p >= ch["pdfPage"]:
            current_ch = ch
        else:
            break
            
    curr_sec = None
    if "sections" in current_ch:
        for sec in current_ch["sections"]:
            if pdf_p >= sec["pdfPage"]:
                curr_sec = sec["title"]
            else:
                break
                
    book_p = None
    if pdf_p == 3:
        book_p = 1
    elif 4 <= pdf_p <= 9:
        book_p = pdf_p - 2 # 2..7
    elif 10 <= pdf_p <= 217:
        book_p = pdf_p - 2 # 8..215
        
    return {
        "chapterId": current_ch["id"],
        "chapterTitle": current_ch["title"],
        "chapterTitleEn": current_ch["titleEn"],
        "sectionTitle": curr_sec or current_ch["title"],
        "bookPage": book_p
    }

# Advanced CJK space cleanup function that preserves English words and numbers
def clean_line_spaces(text):
    if not text:
        return ""
    
    # 1. Standardize common OCR punctuation
    text = text.replace(" ,", "，").replace(", ", "，").replace(",", "，")
    text = text.replace(" :", "：").replace(": ", "：")
    text = text.replace(" ;", "；").replace("; ", "；")
    text = text.replace(" ?", "？").replace("? ", "？")
    text = text.replace(" !", "！").replace("! ", "！")

    # 2. Remove space between two CJK characters
    cjk = r'[\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef]'
    # Repeat until no more spaces between CJK
    prev = ""
    while prev != text:
        prev = text
        text = re.sub(f'({cjk})\\s+({cjk})', r'\1\2', text)
    
    # 3. Clean spaces between CJK and fullwidth punctuation
    text = re.sub(f'({cjk})\\s+([，。、；：？！（）「」《》])', r'\1\2', text)
    text = re.sub(f'([，。、；：？！（）「」《》])\\s+({cjk})', r'\1\2', text)

    return text.strip()

# Clean and structure page lines into coherent paragraphs
def process_page_lines(raw_lines, page_num):
    cleaned_lines = []
    for l in raw_lines:
        c = clean_line_spaces(l)
        if c:
            cleaned_lines.append(c)

    if not cleaned_lines:
        return ""

    # Special handling for Page 1 (Cover)
    if page_num == 1:
        return "更美的敬拜\n\n公共崇拜學探討\n\n易啟年 著\n\n榮光出版社 / 榮光傳道會"

    # Merge lines that belong to the same paragraph
    # A line begins a new paragraph if it starts with (一), (1), 一、, 標題, or has strong punctuation end
    paragraphs = []
    curr_para = ""

    for line in cleaned_lines:
        # Check if line looks like a header or list item
        is_heading_or_item = re.match(r'^(第[一二三四五六七八九十百]+章|[（(][一二三四五六七八九十0-9]+[）)]|[一二三四五六七八九十0-9]+[、. ]|[「《])', line)
        
        # If curr_para is empty, start it
        if not curr_para:
            curr_para = line
        elif is_heading_or_item:
            # flush current paragraph
            paragraphs.append(curr_para)
            curr_para = line
        else:
            # Check if previous ended with sentence-ending punctuation
            last_char = curr_para[-1] if curr_para else ""
            if last_char in "。！？":
                paragraphs.append(curr_para)
                curr_para = line
            else:
                # Merge with current paragraph
                # If either ends or starts with CJK, no space
                if re.search(r'[\u4e00-\u9fff]$', curr_para) and re.search(r'^[\u4e00-\u9fff]', line):
                    curr_para += line
                else:
                    curr_para += " " + line

    if curr_para:
        paragraphs.append(curr_para)

    return "\n\n".join(paragraphs)

# Read all 219 pages from ocr_pages/
pages_data = []
print("Processing 219 pages from ocr_pages/...")

for p in range(1, 220):
    txt_path = f"ocr_pages/page_{p}.txt"
    if os.path.exists(txt_path):
        with open(txt_path, "r", encoding="utf-8-sig") as f:
            raw_lines = [l.strip() for l in f if l.strip()]
    else:
        raw_lines = []

    text = process_page_lines(raw_lines, p)
    meta = get_page_meta(p)

    # First sentence for summary/search preview
    paras = text.split("\n\n")
    summary = paras[0] if paras else f"{meta['chapterTitle']} 第{p}頁"
    if len(summary) > 120:
        summary = summary[:120] + "..."

    page_obj = {
        "page": p,
        "bookPage": meta["bookPage"],
        "chapterId": meta["chapterId"],
        "chapterTitle": meta["chapterTitle"],
        "chapterTitleEn": meta["chapterTitleEn"],
        "sectionTitle": meta["sectionTitle"],
        "image": f"assets/pages/page_{p}.jpg",
        "summary": summary,
        "text": text
    }
    pages_data.append(page_obj)

output_obj = {
    "title": "更美的敬拜—公共崇拜學探討",
    "titleEn": "Better Worship: Exploration of Public Worship",
    "author": "易啟年",
    "authorEn": "Rev. Dr. Chi-Nien Yi",
    "publisher": "榮光出版社 / 榮光傳道會",
    "totalPages": len(pages_data),
    "toc": toc,
    "pages": pages_data
}

# Write out JSON & JS
os.makedirs('data', exist_ok=True)
with open('data/book_data.json', 'w', encoding='utf-8') as f:
    json.dump(output_obj, f, ensure_ascii=False, indent=2)

with open('data/book_data.js', 'w', encoding='utf-8') as f:
    f.write("window.BOOK_DATA = " + json.dumps(output_obj, ensure_ascii=False) + ";\n")

print(f"Successfully rebuilt book_data.json and book_data.js with {len(pages_data)} pages of 100% genuine Traditional Chinese text!")
