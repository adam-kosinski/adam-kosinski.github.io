import sys
import os
import shutil
import filecmp

from hachoir.parser import createParser
from hachoir.metadata import extractMetadata
from hachoir.core import config as HachoirConfig
HachoirConfig.quiet = True

# TODO movies are gotten in UTC
# relevant thread: https://exiftool.org/forum/index.php?topic=7691.0

# TODO account for already existing images - add as a command line input option, default is to not create duplicates
    # this comes up when saving new photos from my phone, where I'll have some photos that were copied and organized previously
    # issue of how can we be sure this is a duplicate - has same IMG number, and same date via creation_date()
# TODO put search for date in creation date - just one function to get the date
# TODO test for hachoir install, if not installed provide install instructions


def creation_date(filepath):
    parser = createParser(filepath)
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
    
    # returns the date, and the rename string if special (e.g. could only narrow down the month) in a tuple

    print("SEARCHING FOR DATE")

    # search for other files with the same name but different extension (works for AAE files for example)
    # use that file's creation date, it's probably right
    without_ext = os.path.splitext(filename)[0]
    for test_filename in files:
        if without_ext in test_filename and test_filename != filename:
            date = creation_date(os.path.join(dir,test_filename))
            if date:
                return date, None
    
    # Look at first files before and after this file that have valid creation dates.
    # Use the date from the before file, and if not available, the after date (sort of makes sense, but sort of arbitrary)

    file_index = files.index(filename)

    # look before
    before_date = None
    for i in range(file_index-1, 0, -1): # loop because may have several PNGs in a row
        before_date = creation_date(os.path.join(dir, files[i]))
        if before_date:
            break
    # look after
    after_date = None
    for i in range(file_index+1, len(files), 1):
        after_date = creation_date(os.path.join(dir, files[i]))
        if after_date:
            break
    
    date = before_date if before_date else after_date

    # For renaming, only print fields of {year, month, day} that match
    date_string = date.strftime(" %Y")
    if before_date and after_date:
        if before_date.day != after_date.day:
            date_string = date.strftime(" %Y-%m")
        else:
            date_string = date.strftime(" %Y-%m-%d")
    
    rename_string = date_string + os.path.splitext(filename)[1]

    return date, rename_string



def file_in_dir(filepath, dir):
    for f in os.listdir(dir):
        if filecmp.cmp(filepath, os.path.join(dir, f)):
            return True
    return False




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

        for cur_dir_, dirs_, files_ in os.walk(dest):
            print(filecmp.dircmp(cur_dir, cur_dir_).same_files)
        
        # process this directory
        for filename in files:
            # print out progress
            file_num += 1 # starts at 0, first file should be 1
            filepath = os.path.join(cur_dir, filename)
            print(f"{file_num}/{file_count}", filepath)     

            # get date the image / video / file was originally made
            date = creation_date(filepath) # datetime object
            rename_string = None # used by search_for_date() to provide a date rename string with less precision than default
            if not date:
                # try using proxy methods
                date, rename_string = search_for_date(filename, cur_dir, files)
                if not date:
                    print("CAN'T FIND DATE, COPYING TO 'DATE_NOT_FOUND' FOLDER")
                    error_path = os.path.join(dest, "DATE_NOT_FOUND")
                    if not os.path.exists(error_path):
                        os.makedirs(error_path)
                    shutil.copy2(filepath, os.path.join(error_path, filename))
                    continue
            
            # get destination folder, determined by year-month
            dest_folder_path = os.path.join(dest, date.strftime("%Y-%m")) # year-month
            if not os.path.exists(dest_folder_path):
                os.makedirs(dest_folder_path)

            # file rename
            if rename:
                new_filename = str(date.date()) + " [" + str(date.time()) + "]" + os.path.splitext(filename)[1]
                if rename_string:
                    new_filename = rename_string
            else:
                new_filename = filename

            # destination path
            dest_path = os.path.join(dest_folder_path, new_filename)
            
            in_dir = file_in_dir(filepath, dest_folder_path)
            print("in_dir", in_dir, "--------------------------------------------" if not in_dir else "")
            if in_dir:
                continue

            # if a file with the same name already exists, and is a different file, append "_(#)" to the filename
            duplicate_counter = 0
            name, extension = os.path.splitext(new_filename)
            while os.path.exists(dest_path):
                new_filename = name + (f"_({duplicate_counter})" if duplicate_counter > 0 else "") + extension
                dest_path = os.path.join(dest_folder_path, new_filename)
                duplicate_counter += 1

            # copy file to sorted folder
            shutil.copy2(filepath, dest_path)




if __name__ == "__main__":

    filecmp.clear_cache()

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