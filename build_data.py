import json
import re
import os

with open('assets/ocr_raw.json', 'r', encoding='utf-8-sig') as f:
    raw_pages = json.load(f)

# Clean CJK space function
def clean_cjk_spaces(text):
    if not text:
        return ""
    # remove spaces between Chinese characters
    pattern = r'([\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef])\s+([\u4e00-\u9fff\u3400-\u4dbf\u3000-\u303f\uff00-\uffef])'
    prev = ''
    while prev != text:
        prev = text
        text = re.sub(pattern, r'\1\2', text)
    # clean extra empty lines
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    return '\n\n'.join(lines)

# Define full Table of Contents based on pages 2-7
# Each entry: { "id": str, "title": str, "bookPage": int, "pdfPage": int, "subsections": [...] }
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

# Helper to find chapter and section for any pdfPage
def get_page_meta(pdf_p):
    # Determine which chapter
    current_ch = toc[0]
    for ch in toc:
        if pdf_p >= ch["pdfPage"]:
            current_ch = ch
        else:
            break
            
    # Determine section
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

# Build enriched pages
pages_data = []
for p_item in raw_pages:
    p_num = p_item["page"]
    cleaned_txt = clean_cjk_spaces(p_item.get("text", ""))
    meta = get_page_meta(p_num)
    
    # If special pages, supplement clear text
    if p_num == 1 and len(cleaned_txt) < 10:
        cleaned_txt = "更美的敬拜——公共崇拜學探討\n\n易啟年 著\n\n榮光出版社 / 榮光傳道會"
    elif p_num == 2 and ("易啟年" not in cleaned_txt):
        cleaned_txt = "易啟年牧師生平簡介\n\n易啟年牧師於1934年生於廣州，3歲喪母。抗日戰爭爆發，隨父親遷往澳門居住，父親在大學教授藝術方面課程。年青時不愛唸書，課業成績不良，與在街頭流浪的張文先生共同喜愛音樂，賭博放縱，每在張先生因賭債被捕時常予以挽救。後來兩人一起受洗歸主，成為一生的好友。兩人並在澳門教會組織詩班、服事音樂事工。這個深刻體驗，讓他重視扶持青少年的工作。\n\n他一生薪資微薄，仍不忘資助青年就讀，給予貧寒學生免費鋼琴課程。家中隨時開放給青年，予以協助，引領無數青年歸主。1956年赴香港伯特利神學院就讀，畢業後在遠東宣教會（OMS）事奉，按立牧職，協助宣教士事工計畫、講台翻譯，並負責教團聯合的青年事工。\n\n易牧師的教學工作在OMS新設的香港聖經學院開始，一生教導眾多神學生，為主培訓許多工人。1968年8月與李順基女士結婚，一起在香港恩磐堂從事青年與貧民工作。1970年全家前往美國，在Azusa Pacific University完成社會心理學碩士。1971年繼續在Washington University, St. Louis修音樂教育碩士及博士。\n\n1980年易牧師患胃癌，因眾人代禱，開刀得以順利，是神的恩典讓他多了28年的歲月作主工。易牧師在台灣中台神學院教學多年，設立聖樂系，任教務主任，於1996年退休。曾在洛杉磯浸信會真道神學院授課，任香港OMS衛道神學院院長，訓練香港及來自中國的神學生。\n\n易牧師曾在中台聖教會、聖弗蘭多宣道會、千橡城基督教會及聖地巴巴拉播道會牧會。著有《教會音樂事工》、《教會兒童教育事工》、作曲編曲在《中台詩歌》，並翻譯許多靈修書籍。另有完稿《更美的崇拜》一書尚待出版。生有一子易芬柏（Leo），一女易愉棕（Lydia），他給予家人充沛的愛無以倫比。一生為主、事主，享年74歲。願一切榮耀歸給我們在至高處的神。"

    # Extract first sentence or snippet for search preview
    lines = [l for l in cleaned_txt.split('\n\n') if l.strip()]
    summary = lines[0] if lines else f"{meta['chapterTitle']} 第{p_num}頁"
    if len(summary) > 120:
        summary = summary[:120] + "..."

    page_obj = {
        "page": p_num,
        "bookPage": meta["bookPage"],
        "chapterId": meta["chapterId"],
        "chapterTitle": meta["chapterTitle"],
        "chapterTitleEn": meta["chapterTitleEn"],
        "sectionTitle": meta["sectionTitle"],
        "image": f"assets/pages/page_{p_num}.jpg",
        "summary": summary,
        "text": cleaned_txt
    }
    pages_data.append(page_obj)

# Output JSON
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

os.makedirs('data', exist_ok=True)
with open('data/book_data.json', 'w', encoding='utf-8') as f:
    json.dump(output_obj, f, ensure_ascii=False, indent=2)

# Also generate data/book_data.js for zero-fetch file:// & static GitHub Pages direct loading
with open('data/book_data.js', 'w', encoding='utf-8') as f:
    f.write("window.BOOK_DATA = " + json.dumps(output_obj, ensure_ascii=False) + ";\n")

print(f"Successfully generated book data with {len(pages_data)} pages!")
