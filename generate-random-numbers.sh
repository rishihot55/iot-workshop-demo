#! /bin/bash

min=-100
range=200

i=0
limit=100
while [ true ]
do
	let "n1=RANDOM%range+min"
	let "n2=RANDOM%range+min"
	let "n3=RANDOM%range+min"
	printf '%d,%d,%d\n' "$n1" "$n2" "$n3"
	let "i += 1"
	sleep 0.2
done
