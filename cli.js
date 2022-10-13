#!/usr/bin/env node
import moment from 'moment-timezone';
import fetch from 'node-fetch';
import minimist from 'minimist';

const args = minimist(process.argv.slice(2));

async function process_args() {
  if (args.h) {
    console.log(
      'Usage: galosh.js [options] -[n|s] LATITUDE -[e|w] LONGITUDE -z TIME_ZONE \n\
      -h            Show this help message and exit. \n\
      -n, -s        Latitude: N positive; S negative. \n\
      -e, -w        Longitude: E positive; W negative. \n\
      -z            Time zone: uses tz.guess() from moment-timezone by default. \n\
      -d 0-6        Day to retrieve weather: 0 is today; defaults to 1. \n\
      -j            Echo pretty JSON from open-meteo API and exit.'
    );
    process.exit(0);
  }

  const timezone = args.z ? args.z : moment.tz.guess();
  const longitude = args.n ? args.n : args.s * -1;
  const latitude = args.e ? args.e : args.w * -1;
  const start = moment().format('YYYY-MM-DD');
  const end = moment().add(7, 'days').format('YYYY-MM-DD');
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${longitude}&longitude=${latitude}&daily=precipitation_hours&current_weather=true&temperature_unit=fahrenheit&timezone=${timezone}&start_date=${start}&end_date=${end}`;
  const response = await fetch(url);
  const data = await response.json();

  let days = args.d ? args.d : 1;
  let dayPhrase = '';

  if (args.j) {
    console.log(JSON.stringify(data));
    process.exit(0);
  }

  if (args._ == 'today') {
    days = 0;
  }

  if (days == 0) {
    dayPhrase = 'today.';
  } else if (days > 1) {
    dayPhrase = 'in ' + days + ' days.';
  } else {
    dayPhrase = 'tomorrow.';
  }

  console.log(data);
  if (data['daily']['precipitation_hours'][days] != 0) {
    console.log(`You might need your galoshes ${dayPhrase}`);
  } else {
    console.log(`You will not need your galoshes ${dayPhrase}`);
  }
}

process_args(args);
