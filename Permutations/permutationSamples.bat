node "c:\Schilz-permutations\permutations.js" -p "c:\\Schilz-permutations\\" -m "1,2,3,*,*" -v "debug"

node "c:\Schilz-permutations\permutations.js" -p "c:\\Schilz-permutations\\" -m "1,2,3,4,*,*" -v "debug"

node "c:\Schilz-permutations\permutations.js" -p "c:\\Schilz-permutations\\" -m "1,2,3,4,5,*,*" -v "debug"

node "c:\Schilz-permutations\permutations.js" -p "c:\\Schilz-permutations\\" -m "1,2,3,4,5,6,*,*" -v "debug"

node "c:\Schilz-permutations\permutations.js" -p "c:\\Schilz-permutations\\" -m "*,2,3,4,5,6,7,*,*" -v "debug"

node "c:\Schilz-permutations\permutations.js" -p "c:\\Schilz-permutations\\" -m "*,2,3,4,5,6,7,*,*,*" -v "debug"

#use -s to substitute the provided array of elements for integers. Note how the array is passed in as a full json object.
node "c:\Schilz-permutations\permutations.js" -m "1,2,3,4,5,6,7,*,*" -p "C:\\Schilz-permutations\\" -s "{\"subs\": [\"A\",\"B\",\"C\",\"D\",[\"E\",\"A#\"],\"F\",\"G\",\"Ab\",\"Bb\"]}"

#When increment is present, the mask contents are ignored--only the mask length is used to determine what permutation set to use. 
node "c:\Schilz-permutations\permutations.js" -m "1,2,3,4,5" -p "C:\\Schilz-permutations\\" -i "5"