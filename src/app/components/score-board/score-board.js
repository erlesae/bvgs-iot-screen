import React, {useEffect, useReducer, useState} from "react";
import "./score-board.css";
import Paho from 'paho-mqtt';

const MQTT_HOST = "mqtt.flespi.io"
const MQTT_PORT = 443
const MQTT_TOPIC = "bvgs"
const MQTT_USER = "FlespiToken 2Y7RKyuakWkn3jfE1lhEtI8nHYUHR7mJWjquIIuQtD3mM6ODiT6zp2KXQtsvqE2a"
const MQTT_PASS = ""

export const ScoreBoard = () => {
  const [client] = useState(new Paho.Client(MQTT_HOST, MQTT_PORT, "clientId-1FG2i7jIhb"));


  const [scores, scoreReducer] = useReducer((state, payload) => {
    return {
      ...state,
      [payload.gruppenavn]: {
        ...state[payload.gruppenavn],
        [payload.oppgavenavn]: payload.svar
      }
    };
  }, {});

  const [tasks, taskReducer] = useReducer((state, taskName) => {
    if (state[taskName] !== undefined) {
      return state;
    } else {
      return {
        ...state,
        [taskName]: {
          color: ""
        }
      }
    }
  }, {});

  useEffect(() => {
    client.connect({
      useSSL: true,
      userName : MQTT_USER,
      password : MQTT_PASS,
      onSuccess: function () {
        console.log('connected to broker');
        client.subscribe(MQTT_TOPIC);
      },
        onFailure: function (err) {
          console.log(err);
        }
    });
    client.onMessageArrived = (message) => handleMessage(JSON.parse(message.payloadString));
  }, [client]);


  const handleMessage = (content) => {
    console.debug(content);
    taskReducer(content.oppgavenavn);
    scoreReducer(content);
  };

  return (
    <section className="score-board">
      <div className="task-names">
        <h2 className="invis"><br/></h2>
        {Object.keys(tasks).map(task => {
          return (
            <div className="task-name" key={task}>{task}</div>
          )
        })}
      </div>
      {Object.keys(scores).map(groupName => {
        return (
          <div className="score-group" key={groupName}>
            <h2>{groupName}</h2>
            {Object.keys(tasks).map(task => {
              return (
                <div className="score" key={groupName + task}>{scores[groupName][task]}</div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
};
