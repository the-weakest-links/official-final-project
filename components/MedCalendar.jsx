import { Text, View, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { MedCalendarStyles } from '../styles/Styles';
import axios from 'axios';

export default function MedCalendar({ user }) {
  const [Medication, setMedication] = useState([]);

  useEffect(() => {
    const makeAsyncCall = async () => {
      const { data } = await axios.get(`http://192.168.10.185:9090/api/prescriptions/user/${user._id}`);
      setMedication(data.prescriptions);
    };
    makeAsyncCall().catch((err) => console.log(err));
  }, []);

  const Reminders = [];
  for (let i = 0; i < Medication.length; i++) {
    for (let x = 0; x < Medication[i].amount; x++) {
      const tD = new Date(getDate(Medication[i].firstPromptTime, Medication[i].frequency, x, false));
      const timestampDate = new Date(
        getDate(Medication[i].firstPromptTime, Medication[i].frequency, x, false) + tD.getTimezoneOffset() * 60000
      );

      if (timestampDate >= Date.now()) {
        Reminders.push(
          <View key={getDate(Medication[i].firstPromptTime, Medication[i].frequency, x, false) + i}>
            <View style={[MedCalendarStyles.container, MedCalendarStyles.flex]}>
              <View style={MedCalendarStyles.leftCol}>
                <Text>{getDay(getDate(Medication[i].firstPromptTime, Medication[i].frequency, x, false))}</Text>
              </View>
              <View style={MedCalendarStyles.rightCol}>
                <Text>{Medication[i].name} at </Text>
                <Text>{getDate(Medication[i].firstPromptTime, Medication[i].frequency, x, true)}</Text>
              </View>
            </View>
          </View>
        );
      }
    }
  }

  Reminders.sort((a, b) => a.key - b.key);
  function getDate(date, frequency, days, humanDate) {
    const addedDays = frequency * days;

    const result = date + addedDays;
    if (humanDate == true) {
      const humanTime = new Date(result * 1000);
      let humanMins = humanTime.getMinutes();
      if (humanMins < 10) {
        humanMins = '' + 0 + humanMins;
      }
      let humanHours = humanTime.getHours() + humanTime.getTimezoneOffset() / 60;
      humanHours === -1 ? (humanHours = 23) : humanHours;
      const humanDate = humanHours + ':' + humanMins + ' on ' + humanTime.getDate() + '/' + (humanTime.getMonth() + 1);

      return humanDate;
    } else {
      return result * 1000;
    }
  }
  function getDay(timestamp) {
    const tD = new Date(timestamp);

    const timestampDate = new Date(timestamp + tD.getTimezoneOffset() * 60000);
    const dN = Date.now();
    const dateNow = new Date(dN + new Date(dN).getTimezoneOffset() * 60000);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[timestampDate.getDay()];
    const humanTimestampDate = '' + timestampDate.getFullYear() + timestampDate.getMonth() + timestampDate.getDate();
    const humanDateNow = '' + dateNow.getFullYear() + dateNow.getMonth() + dateNow.getDate();
    const timestampDateNum = parseInt(humanTimestampDate);
    const dateNowNum = parseInt(humanDateNow);

    if (timestampDateNum == dateNowNum) {
      return 'Today';
    } else if (timestampDateNum == dateNowNum + 1) {
      return 'Tomorrow';
    }
    return dayOfWeek;
  }
  return <ScrollView style={[MedCalendarStyles.container, MedCalendarStyles.outerContainer]}>{Reminders}</ScrollView>;
}
