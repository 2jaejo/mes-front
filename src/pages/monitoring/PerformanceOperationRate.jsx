import React, { useState, useRef, useEffect } from "react";

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import { MainContentStyle } from "css/CommonStyle";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs'

const Main = ({isActive}) => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [data, setData] = useState([]);
  const cl = useState([
    'red',
    'blue',
    'teal',
    'purple',
    'orange',
    'gray',
    'indigo',
    'hotPink',
    'lightGreen',
    'amber',
    'mint',
    'magenta',
    'skyBlue',
    'yellow',
    'salmon',
    'paleGreen',
    'lavender',
    'gold',
    'coralRed',
    'turquoise',
  ]);

  const DEFAULT_FORM = (init={})=> ({
    date: dayjs().format("YYYY-MM-DD"),
    ...init
  });

  // 폼 데이터 상태
  const [formData, setFormData] = useState(DEFAULT_FORM());

  // 폼 데이터 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))



  }

  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    if( !isActive ) return;
    getData();
     
  },[isActive]);


  useEffect(()=>{
    console.log("useEffect2");
    getData();
  },[formData]);



  // 조회
  const getData = (params) => {
    console.log("getData");
    
    axiosInstance
      .post(`/api/getReportProcess`, JSON.stringify(formData))
      .then((res) => {
        
        if(res.data.length === 0) return;

        const rows = res.data;
        const newData = [];
        rows.some( (el) => {
          let rate = el.prod_min / el.total_min * 100;
          rate = rate ? rate.toFixed(2) : 0;

          newData.push({
            name:el.process_name , 
            '양품': el.result_qty ?? 0,
            '불량': el.defect_qty ?? 0,
            '가동시간(분)':el.prod_min ?? 0,
            '가동률(%)':rate,
            'item_name':el.item_name,
            'item_code':el.item_code
          })
        });

        setData(newData);

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger" });
      })
      .finally(() =>{
        
      });
    
  };


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: '10px' }}>
          <p><strong>{label}</strong></p>
          <hr />
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              ● {entry.name}: {entry.value}
            </p>
          ))}

          {/* 추가 정보 예시 */}
          <hr />
          <p>{data['item_code'] ?? ""}</p>
          <p>{data['item_name'] ?? ""}</p>
        </div>
      );
    }
    return null;
  };
  

  // const ExampleBarChart = () => {
  //   return (
  //     <ResponsiveContainer width="100%" height={'100%'}>
  //       <BarChart
  //         data={data}
  //         margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
  //       >
  //         <CartesianGrid strokeDasharray="3 3" />
  //         <XAxis dataKey="name" axisLine={{ stroke: '#aaa' }}  tickLine={false}  tick={{ fontSize: 12 }}/>
  //         <YAxis dataKey="양품" yAxisId="left" type="number" domain={[0, dataMax => Math.ceil(Math.max(100, dataMax * 1.1))]} label={{ value: '수량', angle: 0, position: 'insideTopLeft', offset: 20}}/>
  //         <YAxis dataKey="가동시간(분)" yAxisId="right" orientation="right" type="number" domain={[0 , dataMax => Math.ceil(Math.max(100, dataMax * 1.1))]} label={{ value: '(분)', angle: 0, position: 'insideTopRight', offset: 20}}/>
  //         <Tooltip content={<CustomTooltip />}/>
  //         <Legend />
  //         <Bar dataKey="양품" yAxisId="left" fill="green" activeBar={<Rectangle fill="green" stroke="green" />} />
  //         <Bar dataKey="불량" yAxisId="left" fill="red" activeBar={<Rectangle fill="red" stroke="red" />} />
  //         <Bar dataKey="가동률(%)" yAxisId="right" fill="orange" activeBar={<Rectangle fill="orange" stroke="orange" />} />
  //         <Bar dataKey="가동시간(분)" yAxisId="right" fill="blue" activeBar={<Rectangle fill="blue" stroke="blue" />} />
  //       </BarChart>
  //     </ResponsiveContainer>
  //   );
  // };
  const ExampleBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={'100%'}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: 5, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" axisLine={{ stroke: '#aaa' }}  tickLine={false}  tick={{ fontSize: 10 }}/>
          <YAxis dataKey="양품" yAxisId="left" type="number" domain={[0, dataMax => Math.ceil(Math.max(100, dataMax * 1.1))]} allowDataOverflow tickLine={false} label={{ value: '수량', angle: 0, position: 'insideTopLeft', offset: 20}}/>
          <YAxis dataKey="가동시간(분)" yAxisId="right" orientation="right" type="number" domain={[0, dataMax => Math.ceil(Math.max(100, dataMax * 1.1))]} allowDataOverflow tickLine={false} label={{ value: '(분)', angle: 0, position: 'insideTopRight', offset: 20}}/>
          {/* <Tooltip /> */}
          <Tooltip content={<CustomTooltip />}/>
          <Legend />
          <Bar dataKey="양품" isAnimationActive={false} yAxisId="left" fill="green" activeBar={<Rectangle fill="green" stroke="green" />} />
          <Bar dataKey="불량" isAnimationActive={false} yAxisId="left" fill="red" activeBar={<Rectangle fill="red" stroke="red" />} />
          <Bar dataKey="가동률(%)" isAnimationActive={false} yAxisId="right" fill="orange" activeBar={<Rectangle fill="orange" stroke="orange" />} />
          <Bar dataKey="가동시간(분)" isAnimationActive={false} yAxisId="right" fill="blue" activeBar={<Rectangle fill="blue" stroke="blue" />} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  
  return (
    <div style={MainContentStyle}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />

      <div className="bg-light">
        <Row className="">
          <Col className="">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }} className="m-0">
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">날짜</th>
                  <td className="align-middle">
                    <div className="">
                      <Form.Control 
                      type="date"
                      name="date"
                      value={formData.date ?? ""}
                      onChange={handleFormChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                    </div>
                  </td>
          
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>
                  
                </tr>
              </tbody>
            </Table>

          </Col>
        </Row>
      </div>

      <ExampleBarChart />
    </div>
  );
}

export default Main;
