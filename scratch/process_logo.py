from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    colors = {}
    
    for item in data:
        r, g, b, a = item
        # If it's a white or very light pixel, make it transparent
        if r > 240 and g > 240 and b > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            # Count colors to find the primary logo color (excluding near-transparent or white/black)
            if a > 200 and not (r > 240 and g > 240 and b > 240) and not (r < 20 and g < 20 and b < 20):
                hex_col = f"#{r:02x}{g:02x}{b:02x}"
                colors[hex_col] = colors.get(hex_col, 0) + 1

    img.putdata(new_data)
    img.save(output_path, "PNG")
    
    # Find the most common color
    if colors:
        dominant_color = max(colors, key=colors.get)
        print(f"Dominant Color: {dominant_color}")
    else:
        print("Dominant Color: #5b5da8") # fallback

process_logo('public/sanchit-logo.png', 'public/sanchit-logo-transparent.png')
