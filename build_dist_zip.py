#!/usr/bin/env python3
import os
import zipfile
import shutil

def build_dist():
    zip_filenames = ['dist.zip', 'dist_hostinger_ready.zip', 'public/dist.zip', 'public/dist_hostinger_ready.zip']
    
    # Files to include directly in root of zip
    single_files = [
        'index.html',
        '.htaccess',
        'config.php',
        'db.php',
        'database.sql',
        'install.php',
        'get_config.php',
        'save_config.php',
        'get_system_config.php',
        'save_system_config.php',
        'get_articles.php',
        'save_article.php',
        'get_users.php',
        'update_user.php',
        'save_user.php',
        'delete_user.php',
        'sync_all_users.php',
        'get_bio.php',
        'save_bio.php',
        'get_templates.php',
        'save_template.php',
        'delete_template.php',
        'get_transactions.php',
        'create_transaction.php',
        'delete_transaction.php',
        'adjust_balance.php',
        'check_sepay_status.php',
        'sepay_webhook.php',
        'login.php',
        'register.php',
        'upload.php',
        'bo-cong-thuong.svg',
        'zalo-icon.svg'
    ]

    # Directories to include
    dir_entries = [
        ('assets', 'assets'),
        ('data', 'data'),
        ('uploads', 'uploads')
    ]

    # Ensure uploads directory exists
    os.makedirs('uploads', exist_ok=True)
    if not os.path.exists('uploads/.gitkeep'):
        with open('uploads/.gitkeep', 'w') as f:
            f.write('')

    tmp_zip = 'dist_temp.zip'
    with zipfile.ZipFile(tmp_zip, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in single_files:
            if os.path.isfile(f):
                z.write(f, f)
                print(f"Added file: {f}")
            else:
                print(f"WARNING: File not found: {f}")

        for src_dir, dest_dir in dir_entries:
            if os.path.isdir(src_dir):
                for root, dirs, files in os.walk(src_dir):
                    for file in files:
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, src_dir)
                        arc_name = os.path.join(dest_dir, rel_path)
                        z.write(full_path, arc_name)
                        print(f"Added dir file: {arc_name}")

    # Copy to target zip paths
    os.makedirs('public', exist_ok=True)
    for target in zip_filenames:
        shutil.copy(tmp_zip, target)
        print(f"Generated: {target} ({os.path.getsize(target)} bytes)")

    if os.path.exists(tmp_zip):
        os.remove(tmp_zip)

if __name__ == '__main__':
    build_dist()
