import json
import re

def _rewrite_image_urls(text: str, image_base_url: str) -> str:
    """
    Rewrite relative image URLs in markdown image syntax to absolute URLs.
    
    Example:
        ![](img/img1.png)  →  ![](/data/Mạng máy tính/markdown/img/img1.png)
        ![alt](img/foo.jpg) →  ![alt](/data/.../img/foo.jpg)
    
    Absolute URLs (starting with http/https//) are left unchanged.
    """
    if not image_base_url:
        return text

    def replacer(m):
        alt = m.group(1)
        src = m.group(2)
        # Không rewrite nếu đã là URL tuyệt đối
        if src.startswith(("http://", "https://", "/", "data:")):
            return m.group(0)
        # Ghép base_url + src, đảm bảo không trùng dấu /
        base = image_base_url.rstrip("/")
        return f"![{alt}]({base}/{src})"

    return re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", replacer, text)


def parse_md(filepath, image_base_url: str = ""):

    with open(filepath, "r", encoding="utf-8") as f:
        text = f.read()

    # Rewrite relative image URLs → absolute URL paths served by /data/ static mount
    if image_base_url:
        text = _rewrite_image_urls(text, image_base_url)

    # Split blocks by '---' on their own line to avoid splitting markdown tables
    blocks = re.split(r"(?m)^---$", text)
    quiz_list = []
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        quiz = {}
        lines = block.split("\n")
        current_key = None
        
        for line in lines:
            line_stripped = line.strip()
            
            if line_stripped.startswith("#"):
                if "name" not in quiz:
                    quiz["name"] = line_stripped.lstrip("#").strip()
                continue
                
            if line_stripped.startswith("- **id:**"):
                quiz["id"] = int(line_stripped.replace("- **id:**", "").strip())
                current_key = "id"
                
            elif line_stripped.startswith("- **type:**"):
                # Supporting 4 types: single, multiple, essay, short_answer
                quiz["type"] = line_stripped.replace("- **type:**", "").strip()
                current_key = "type"
                
            elif line_stripped.startswith("- **question:**"):
                quiz["question"] = line_stripped.replace("- **question:**", "").strip()
                current_key = "question"
                
            elif line_stripped.startswith("- **options:**"):
                quiz["options"] = []
                current_key = "options"
                
            elif line_stripped.startswith("- **answer:**"):
                ans_str = line_stripped.replace("- **answer:**", "").strip()
                if ans_str == "":
                    quiz["answer"] = ""
                elif ans_str.startswith("["):
                    quiz["answer"] = json.loads(ans_str)
                elif ans_str.isdigit() and quiz.get("type") == "single":
                    # Biến chuỗi "0" thành số nguyên 0
                    quiz["answer"] = int(ans_str)
                else:
                    quiz["answer"] = ans_str
                current_key = "answer"
                
            elif line_stripped.startswith("- **explanation:**"):
                quiz["explanation"] = line_stripped.replace("- **explanation:**", "").strip()
                current_key = "explanation"
            
            elif current_key == "options" and line_stripped.startswith("-"):
                opt_val = line_stripped[1:].strip() 
                quiz["options"].append(opt_val)
            
            elif current_key in ["question", "explanation", "answer"] and line_stripped:
                quiz[current_key] += "\n" + line.strip()

        if "options" in quiz and len(quiz["options"]) == 0:
            del quiz["options"]
            
        if quiz:
            for k in ["name", "question", "explanation", "answer"]:
                if k in quiz and isinstance(quiz[k], str):
                    quiz[k] = quiz[k].replace("<br>", "\n").replace("<br/>", "\n").replace("<br />", "\n")
            quiz_list.append(quiz)
    return quiz_list

