import requests
from bs4 import BeautifulSoup
import json
import time

def get_product_urls(category_url, max_urls=20): # Limiting to 20 for speed, user can increase
    urls = []
    page = 1
    headers = {'User-Agent': 'Mozilla/5.0'}
    
    while len(urls) < max_urls:
        url = f"{category_url}?page={page}"
        print(f"Fetching category page {page}...")
        try:
            res = requests.get(url, headers=headers, timeout=10)
            res.raise_for_status()
        except Exception as e:
            print(f"Error fetching page {page}: {e}")
            break
            
        soup = BeautifulSoup(res.text, 'html.parser')
        items = soup.find_all('div', class_='pro-item')
        if not items:
            items = soup.find_all('div', class_='product-item')
            
        if not items:
            break
            
        for item in items:
            a_tag = item.find('a')
            if a_tag and a_tag.get('href'):
                href = a_tag.get('href')
                if not href.startswith('http'):
                    href = 'https://laptop88.vn' + href
                if href not in urls:
                    urls.append(href)
                if len(urls) >= max_urls:
                    break
        page += 1
        time.sleep(1)
        
    return urls

def scrape_product(url):
    print(f"Scraping: {url}")
    try:
        response = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return None

    soup = BeautifulSoup(response.content, 'html.parser')
    
    title_elem = soup.find('h1')
    name = title_elem.text.strip() if title_elem else "Unknown Laptop"
    
    brands = ["Asus", "Acer", "Dell", "HP", "Lenovo", "MSI", "Apple", "Gigabyte"]
    brand_name = "Other"
    for b in brands:
        if b.lower() in name.lower():
            brand_name = b
            break
            
    desc_html = ""
    desc_div = soup.find('div', class_='content-desc')
    if not desc_div:
        desc_div = soup.find('div', class_='content-desc-detail')
    
    if desc_div:
        desc_html = str(desc_div)
    
    specs = {}
    tables = soup.find_all('table')
    for t in tables:
        rows = t.find_all('tr')
        if len(rows) > 5:
            for row in rows:
                cols = row.find_all(['td', 'th'])
                if len(cols) == 2:
                    key = cols[0].text.strip()
                    val = cols[1].text.strip()
                    val = val.replace('\n', ', ').strip()
                    specs[key] = val
            break
            
    images = []
    img_tags = soup.find_all('img')
    for img in img_tags:
        src = img.get('src') or img.get('data-src')
        if src and ('media/product' in src.lower() or 'upload' in src.lower()):
            if not src.startswith('http'):
                src = 'https://laptop88.vn' + src
            if src not in images:
                images.append(src)
    images = images[:10]
    
    price_elem = soup.find(class_=lambda c: c and 'price' in c.lower() and 'current' in c.lower())
    price = 15000000
    if price_elem:
        price_text = ''.join(filter(str.isdigit, price_elem.text))
        if price_text:
            price = int(price_text)

    product_data = {
        "name": name,
        "brand": brand_name,
        "category": "Laptop", # We will fix categories later or let it be
        "description": desc_html,
        "variants": [
            {
                "sku": f"SKU-{int(time.time()*1000)}",
                "price": price,
                "specs": specs,
                "image_urls": images
            }
        ]
    }
    return product_data

if __name__ == "__main__":
    category_url = "https://laptop88.vn/laptop-moi.html"
    
    print("Fetching product URLs...")
    urls = get_product_urls(category_url, max_urls=20) # Scrape 20 for now
    print(f"Found {len(urls)} URLs. Starting scraper...")
    
    all_products = []
    for u in urls:
        data = scrape_product(u)
        if data:
            all_products.append(data)
        time.sleep(1)
        
    with open('final_gallery_data.json', 'w', encoding='utf-8') as f:
        json.dump(all_products, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully scraped {len(all_products)} real products directly into final_gallery_data.json")
