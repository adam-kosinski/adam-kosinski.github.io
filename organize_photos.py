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
    # filename includes path
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


def search_for_date(filename, dir, files):
    # filename of file (without path), dir is path to current directory, files is a list of all other files in the same directory
    # employs proxies to find the date if creation_date() failed, mostly used for .AAE and .PNG files
    
    print("SEARCHING FOR DATE")

    # search for other files with the same name but different extension (works for AEE files for example)
    # use that file's creation date instead, and set that file as paired to this one (so that this file will be renamed the same way if a rename occurs)
    without_ext = os.path.splitext(filename)[0]
    for test_filename in files:
        if without_ext in test_filename and test_filename != filename:
            possible_date = creation_date(os.path.join(dir,test_filename))
            if possible_date:
                return possible_date

    return None


def main(src, dest, rename=False):
    print(f"Organizing photos in {src}, into folder {dest}")

    # get total number of files for progress printing
    file_count = 0
    for cur_dir, dirs, files in os.walk(src):
        # default is to put the dest folder inside the src folder, don't look into it for photos
        if dest in cur_dir:
            continue
        file_count += len(files)

    # go through folder structure, finding all files, and processing them
    file_num = 0
    for cur_dir, dirs, files in os.walk(src):
        if dest in cur_dir:
            continue
        
        # process this directory
        for filename in files:
            # print out progress
            file_num += 1 # starts at 0, first file should be 1
            filepath = os.path.join(cur_dir, filename)
            print(f"{file_num}/{file_count}", filepath)            

            # get date the image / video / file was originally made
            date = creation_date(filepath) # datetime object
            if not date:
                # try using proxy methods
                date = search_for_date(filename, cur_dir, files)
                if not date:
                    print("CAN'T FIND DATE")
                    continue
            
            # get destination folder, determined by year-month
            dest_folder_path = os.path.join(dest, date.strftime("%Y-%m")) # year-month
            if not os.path.exists(dest_folder_path):
                os.makedirs(dest_folder_path)

            # file rename
            if rename:
                filename = str(date) + os.path.splitext(filename)[1]
            # prevent replacing existing files with the duplicate counter: append _(#)
            filename_split = os.path.splitext(filename)
            duplicate_counter = 0
            while os.path.exists(os.path.join(dest_folder_path, filename)):
                filename = filename_split[0] + (f"_({duplicate_counter})" if duplicate_counter > 0 else "") + filename_split[1]
                duplicate_counter += 1

            # copy file to sorted folder, don't do this for paired files since we don't know all the renames yet
            shutil.copy2(filepath, os.path.join(dest_folder_path, filename))
            

if __name__ == "__main__":
    # check syntax
    if not (len(sys.argv) == 2 or len(sys.argv) == 3):
        print("Syntax:")
        print(f"python3 {__file__} [folder with photos] [folder to copy organized photos into (optional)]")
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
    print("Would you also like to rename the files with their date and time taken?")
    print("yes/no:", end=" ")
    res = input().lower()
    rename = (res == "yes" or res == "y")

    main(src, dest, rename)