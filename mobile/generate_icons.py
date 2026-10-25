import os
from PIL import Image, ImageDraw

def generate_icons():
    logo_path = 'logo.png'
    logo = Image.open(logo_path).convert('RGBA')
    logo_w, logo_h = logo.size
    aspect = logo_w / logo_h

    # 1. Generate 1024x1024 icon.png (white bg, centered logo)
    canvas_size = 1024
    target_w = 520
    target_h = int(target_w / aspect)
    logo_resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

    icon_1024 = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
    offset_x = (canvas_size - target_w) // 2
    offset_y = (canvas_size - target_h) // 2
    icon_1024.paste(logo_resized, (offset_x, offset_y), logo_resized)
    icon_1024.save('mobile/assets/icon.png', 'PNG')
    icon_1024.save('mobile/assets/splash-icon.png', 'PNG')
    print("Saved mobile/assets/icon.png & splash-icon.png")

    # 2. Generate android-icon-foreground.png (1024x1024 transparent, centered logo)
    foreground_1024 = Image.new('RGBA', (canvas_size, canvas_size), (0, 0, 0, 0))
    foreground_1024.paste(logo_resized, (offset_x, offset_y), logo_resized)
    foreground_1024.save('mobile/assets/android-icon-foreground.png', 'PNG')

    # 3. Generate android-icon-background.png (1024x1024 solid white)
    bg_1024 = Image.new('RGBA', (canvas_size, canvas_size), (255, 255, 255, 255))
    bg_1024.save('mobile/assets/android-icon-background.png', 'PNG')
    print("Saved mobile/assets/android-icon-foreground.png & background.png")

    # 4. Generate native Android mipmap assets
    res_dir = 'mobile/android/app/src/main/res'
    
    # Standard mipmap sizes for launcher: (mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192)
    # Adaptive foreground sizes: (mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432)
    mipmaps = {
        'mipmap-mdpi': (48, 108),
        'mipmap-hdpi': (72, 162),
        'mipmap-xhdpi': (96, 216),
        'mipmap-xxhdpi': (144, 324),
        'mipmap-xxxhdpi': (192, 432),
    }

    for folder, (launcher_size, fg_size) in mipmaps.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)

        # A. ic_launcher.png (White background, small centered logo with ample padding)
        launcher_img = Image.new('RGBA', (launcher_size, launcher_size), (255, 255, 255, 255))
        lw = int(launcher_size * 0.58)
        lh = int(lw / aspect)
        lr = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        lx = (launcher_size - lw) // 2
        ly = (launcher_size - lh) // 2
        launcher_img.paste(lr, (lx, ly), lr)
        launcher_img.save(os.path.join(folder_path, 'ic_launcher.png'), 'PNG')

        # B. ic_launcher_round.png (Circular masked on white background)
        mask = Image.new('L', (launcher_size, launcher_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.ellipse((0, 0, launcher_size, launcher_size), fill=255)
        
        round_img = Image.new('RGBA', (launcher_size, launcher_size), (0, 0, 0, 0))
        round_img.paste(launcher_img, (0, 0), mask)
        round_img.save(os.path.join(folder_path, 'ic_launcher_round.png'), 'PNG')

        # C. ic_launcher_foreground.png (Adaptive icon foreground, 108dp base, centered logo)
        fg_img = Image.new('RGBA', (fg_size, fg_size), (0, 0, 0, 0))
        # Keep logo within the inner 50% safe zone of 108dp
        fw = int(fg_size * 0.48)
        fh = int(fw / aspect)
        fr = logo.resize((fw, fh), Image.Resampling.LANCZOS)
        fx = (fg_size - fw) // 2
        fy = (fg_size - fh) // 2
        fg_img.paste(fr, (fx, fy), fr)
        fg_img.save(os.path.join(folder_path, 'ic_launcher_foreground.png'), 'PNG')

        print(f"Generated icons for {folder}")

    # Also update splashscreen images in drawable folders
    drawables = {
        'drawable-mdpi': 120,
        'drawable-hdpi': 180,
        'drawable-xhdpi': 240,
        'drawable-xxhdpi': 360,
        'drawable-xxxhdpi': 480,
    }
    for folder, splash_w in drawables.items():
        folder_path = os.path.join(res_dir, folder)
        if os.path.exists(folder_path):
            splash_h = int(splash_w / aspect)
            sr = logo.resize((splash_w, splash_h), Image.Resampling.LANCZOS)
            splash_canvas = Image.new('RGBA', (splash_w + 40, splash_h + 40), (255, 255, 255, 255))
            splash_canvas.paste(sr, (20, 20), sr)
            splash_canvas.save(os.path.join(folder_path, 'splashscreen_image.png'), 'PNG')
            print(f"Updated splash in {folder}")

    print("All icons successfully generated!")

if __name__ == '__main__':
    generate_icons()
