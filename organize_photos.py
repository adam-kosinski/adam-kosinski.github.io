import sys
import os
import shutil

from hachoir.parser import createParser
from hachoir.metadata import extractMetadata
from hachoir.core import config as HachoirConfig
HachoirConfig.quiet = True


# TODO guess date based on neighbors/filename if can't find date in metadata (useful for AAE, PNG files)
# TODO test for hachoir install, automate that if user agrees in prompt


def creation_date(filename):
    parser = createParser(filename)
    metadata = extractMetadata(parser)

    if not metadata:
        return None

    # Check for creation date keys, in order of most likely to be correct
    # note: can get metadata keys like so:
    # print(metadata.exportPlaintext(human=False))
    if metadata.has('date_time_original'):
        return metadata.get('date_time_original')
    if metadata.has('creation_date'):
        return metadata.get('creation_date')
    return None




def main(src, dest, rename=False):
    print(f"Organizing photos in {src}, into folder {dest}")

    # get total number of files for progress printing
    file_count = 0
    for root, dirs, files in os.walk(src):
        # default is to put the dest folder inside the src folder, don't look into it for photos
        if dest in root:
            continue
        file_count += len(files)

    # go through folder structure, finding all files, and processing them
    file_num = 0
    for root, dirs, files in os.walk(src):
        if dest in root:
            continue

        # process this directory
        for filename in files:
            file_num += 1 # starts at 0, first file should be 1
            filepath = os.path.join(root, filename)
            print(f"{file_num}/{file_count}", filepath)

            # get destination folder, determined by year-month
            date = creation_date(filepath) # datetime object
            if not date:
                print("CAN'T FIND DATE")
                continue
            dest_folder_path = os.path.join(dest, date.strftime("%Y-%m")) # year-month
            if not os.path.exists(dest_folder_path):
                os.makedirs(dest_folder_path)
            
            if rename:
                filename = date.strftime("%Y-%m-%d") + os.path.splitext(filename)[1]
            
            # prevent replacing existing files with the duplicate counter
            filename_split = os.path.splitext(filename)
            duplicate_counter = 0
            while os.path.exists(os.path.join(dest_folder_path, filename)):
                filename = filename_split[0] + (f"_({duplicate_counter})" if duplicate_counter > 0 else "") + filename_split[1]
                duplicate_counter += 1

            # copy file to sorted folder
            shutil.copy2(filepath, os.path.join(dest_folder_path, filename))


if __name__ == "__main__":
    # check syntax
    if not (len(sys.argv) == 2 or len(sys.argv) == 3):
        print("Syntax:")
        print("python3 photo_organize.py [folder with photos] [folder to copy organized photos into (optional)]")
        exit()
    
    if not os.path.isdir(sys.argv[1]):
        print("The photo folder you specified is not a valid folder.")
        exit()
    
    # determine src and dest directories
    src = sys.argv[1]
    if len(sys.argv) == 3:
        dest = sys.argv[2]
    else:
        # set default destination folder
        dest = os.path.join(sys.argv[1], "organized_photos")

    # check if stuff exists in the dest folder before doing stuff
    if os.path.exists(dest) and len(os.listdir(dest)) > 0:
        print(f"There appears to already be files in the destination folder ({dest}).")
        print("Would you like to continue anyways? No files will be overwritten if you do.")
        print("yes/no:", end=" ")
        res = input().lower()
        if not (res == "yes" or res == "y"):
            exit()

    # prompt for rename option
    print("Would you also like to rename the files with format 'yyyy-mm-dd_(#)' based on date taken?")
    print("yes/no:", end=" ")
    res = input().lower()
    rename = (res == "yes" or res == "y")

    main(src, dest, rename)