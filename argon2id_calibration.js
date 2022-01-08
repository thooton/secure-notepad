import argon2 from 'argon2';
import * as rs from 'readline-sync';
import process from 'process';

var threads = rs.questionInt('How many cores can you dedicate to each call? ') * 2;
var megabytes = rs.questionInt('How many megabytes can you dedicate to each call? ');
console.log("Libsodium's guidelines recommend 1000ms for web applications, 5000ms for desktop applications.");
var desired_ms = rs.questionInt('How many milliseconds should each call take? ');

var options = {
    type: argon2.argon2id,
    memoryCost: megabytes * 1024,
    hashLength: 128,
    timeCost: 2,
    parallelism: threads
}

async function main() {
    var last_ms = 0;
    while (true) {
        var randomString = Math.random.toString();
        var start = process.hrtime.bigint();
        const hash = await argon2.hash(randomString, options);
        var end = process.hrtime.bigint();
        var time_ms = (end - start) / 1000000n;
        var output = `${options.timeCost} passes, ${time_ms} milliseconds`;
        if (time_ms <= desired_ms) {
            output += '; lesser';
            console.log(output);
            options.timeCost++;
        } else if (time_ms > desired_ms && options.timeCost <= 2) {
            console.log(output);
            console.log('Time taken is too large; memory must be lowered');
            megabytes = rs.questionInt('How many megabytes can you dedicate to each call? ');
            options.memoryCost = megabytes * 1024;
        } else {
            output += '; greater';
            console.log(output);
            options.timeCost--;
            var printedOptions = {
                memory_use_mb: megabytes,
                threads: threads,
                passes: options.timeCost
            }
            console.log(`Recommended options:`);
            console.log(JSON.stringify(printedOptions, null, '\t'));
            console.log(`These options resulted in ${last_ms}ms of time being spent to calculate the hash.`)
            break;
        }
        last_ms = time_ms;
    }
}

main();