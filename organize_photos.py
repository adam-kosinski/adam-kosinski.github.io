import sys
import os
import shutil

from hachoir.parser import createParser
from hachoir.metadata import extractMetadata
from hachoir.core import config as HachoirConfig
HachoirConfig.quiet = True

# TODO make IMG numbering play nice (e.g. if from long ago or diff phone, will have a diff numbering)
    # corollary: same IMG name with different dates? Poor organization
    # maybe this isn't an issue - check phone change boundary
# TODO account for already existing images - add as a command line input option, default is to not create duplicates
    # this comes up when saving new photos from my phone, where I'll have some photos that were copied and organized previously
    # issue of how can we be sure this is a duplicate - has same IMG number, and same date via creation_date()
# TODO put search for date in creation date - just one function to get the date
# TODO test for hachoir install, if not installed provide install instructions


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
    # Use the date from the before file, and if not available, the after date (arbitrary convention)
    file_index = files.index(filename)

    before_date = None
    before_index = file_index-1
    while before_index >= 0:
        before_date = creation_date(os.path.join(dir, files[before_index]))
        if before_date:
            break
        before_index -= 1
    
    after_date = None
    after_index = file_index+1
    if not after_date: # no need to look if we already have a before date
        while after_index < len(files):
            after_date = creation_date(os.path.join(dir, files[after_index]))
            if after_date:
                break
            after_index += 1
    
    # get date
    date = before_date if before_date else after_date
    if not date:
        return None, None
    
    # For renaming, only print fields of {year, month, day} that match
    date_suffix = None
    if before_date and after_date:
        if before_date.month != after_date.month:
            date_suffix = date.strftime(" %Y")
        elif before_date.day != after_date.day:
            date_suffix = date.strftime(" %Y-%m")
        else:
            date_suffix = date.strftime(" %Y-%m-%d")
    filename_split = os.path.splitext(filename)
    rename_string = filename_split[0] + (date_suffix if date_suffix else "") + filename_split[1]

    return date, rename_string


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
            filename_split = os.path.splitext(filename)
            if rename:
                filename = filename_split[0] + " " + date.strftime("%Y-%m-%d") + filename_split[1]
                if rename_string:
                    filename = rename_string
                
            # prevent replacing existing files with the duplicate counter: append _(#)
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