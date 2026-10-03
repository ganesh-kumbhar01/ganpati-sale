from PIL import Image

def remove_background(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    width, height = img.size
    cx, cy = width / 2, height / 2
    max_radius = width * 0.45  # Ignore the vignette outside this radius
    
    for y in range(height):
        for x in range(width):
            r, g, b, a = data[y * width + x]
            
            # Check distance from center to remove the vignette completely
            dist = ((x - cx)**2 + (y - cy)**2)**0.5
            if dist > max_radius:
                new_data.append((255, 255, 255, 0))
                continue
                
            # If the pixel is very light (cream/white background)
            # The background is roughly #FDFDFD or #F0F0F0
            if r > 230 and g > 230 and b > 230:
                # Make it transparent
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append((r, g, b, 255))
                
    img.putdata(new_data)
    
    # Auto-crop to bounding box
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(output_path, "PNG")
    print(f"Saved {output_path}")

remove_background('public/new-logo.jpg', 'public/logo-transparent.png')
