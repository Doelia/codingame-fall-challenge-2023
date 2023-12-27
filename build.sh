output="dist/build.ts"

echo "" > $output
cat src/types.ts >> $output
cat src/functions/*.ts >> $output
cat src/main.ts >> $output

# remove all lines that start with "import" in the build.tsfile
sed '/^import/d' $output > $output.ts
rm $output
mv $output.ts $output
