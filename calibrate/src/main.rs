use question::{Question, Answer};
use std::str::FromStr;
use argon2::{self, Config, Variant, Version, ThreadMode};
use std::time::Instant;
use serde::Serialize;

#[derive(Serialize)]
struct PrintedOptions {
    memory_use_mb: u32,
    threads: u32,
    passes: u32
}

fn main() {
    let threads = get_number(
        "How many cores can you dedicate to each call?"
    ) * 2;
    let mut megabytes = get_number(
        "How many megabytes of memory can you dedicate to each call?"
    );
    println!("Libsodium's guidelines recommend 1000ms for web applications, 5000ms for desktop applications.");
    let desired_ms = get_number(
        "How many milliseconds should each call take?"
    ).into();

    let mut config = Config::default();
    config.variant = Variant::Argon2id;
    config.version = Version::Version13;
    config.mem_cost = megabytes * 1024;
    config.hash_length = 128;
    config.time_cost = 2;
    config.thread_mode = ThreadMode::Parallel;
    config.lanes = threads;

    let mut last_ms = 0;
    loop {
        let charset = 
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890-=[];',./";
        let pwd = random_string::generate(
            128, 
            charset
        );
        let salt = random_string::generate(
            32,
            charset
        );

        let start = Instant::now();
        
        argon2::hash_encoded(
            pwd.as_bytes(),
            salt.as_bytes(), 
            &config
        ).unwrap();

        let time_ms: u32 = start.elapsed().as_millis().try_into().unwrap();

        let mut output = format!(
            "{} passes, {} milliseconds",
            config.time_cost,
            time_ms
        );

        if time_ms <= desired_ms {
            output += "; lesser";
            println!("{}", output);
            config.time_cost += 1;
        } else if (time_ms > desired_ms) && (config.time_cost <= 2) {
            println!("{}", output);
            println!("Time taken is too large; memory must be lowered");
            megabytes = get_number(
                "How many megabytes can you dedicate to each call?"
            );
            config.mem_cost = megabytes * 1024;
        } else {
            output += "; greater";
            println!("{}", output);
            config.time_cost -= 1;
            let printed_options = PrintedOptions {
                memory_use_mb: megabytes,
                threads: threads,
                passes: config.time_cost
            };
            println!("Recommended argon2_options:");
            println!("{}", serde_json::to_string_pretty(&printed_options).unwrap());
            println!(
                "These options resulted in {}ms of time being spent to calculate the hash",
                last_ms
            );
            break;
        }
        last_ms = time_ms;
    }
}

fn get_number(prompt: &str) -> u32 {
    loop {
        match Question::new(prompt).ask().unwrap() {
            Answer::RESPONSE(the_response) => {
                let num = u32::from_str(&the_response);
                match num {
                    Ok(real_num) => {
                        break real_num;
                    }
                    Err(_) => {
                        println!("Not a number");
                    }
                }
            },
            something_else => {
                panic!("{:?}", something_else);
            }
        };
    }
}