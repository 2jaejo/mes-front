import React, { useState, useRef } from "react";

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";
import { Row, Col, Form, Button } from 'react-bootstrap';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Main = () => {
  
  const [data, setData] = useState([
    { name: 'Page A', '양품': 4000, '불량': 240, '가동시간': 2400 },
    { name: 'Page B', '양품': 3000, '불량': 139, '가동시간': 2210 },
    { name: 'Page C', '양품': 2000, '불량': 980, '가동시간': 2290 },
    { name: 'Page D', '양품': 2780, '불량': 390, '가동시간': 2000 },
    { name: 'Page E', '양품': 1890, '불량': 480, '가동시간': 2181 },
    { name: 'Page F', '양품': 2390, '불량': 380, '가동시간': 2500 },
    { name: 'Page G', '양품': 3490, '불량': 430, '가동시간': 2100 },
    { name: 'Page H', '양품': 3490, '불량': 430, '가동시간': 2100 },
    { name: 'Page I', '양품': 3490, '불량': 430, '가동시간': 2100 },
    { name: 'Page J', '양품': 3490, '불량': 430, '가동시간': 2100 },
    { name: 'Page K', '양품': 3490, '불량': 430, '가동시간': 2100 },
    { name: 'Page L', '양품': 3490, '불량': 430, '가동시간': 2100 }
  ]);

  const ExampleBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={'100%'}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis type="number" domain={[0, 'dataMax + 1000']} />
          <Tooltip />
          <Legend />
          <Bar dataKey="양품" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          <Bar dataKey="불량" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
          <Bar dataKey="가동시간" fill="blue" activeBar={<Rectangle fill="green" stroke="red" />} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  
  return (
    <div style={{ height: '87vh', display: 'flex', flexDirection: 'column' }}>
      <ExampleBarChart />
    </div>
  );
}

export default Main;
