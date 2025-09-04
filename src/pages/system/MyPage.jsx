import React, { useState, useEffect, useRef } from "react";

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { MainContentStyle } from "css/CommonStyle";

const MyPage = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  

  const [form, setForm] = useState({
    user_id: '',
    user_nm: '',
    pw: '',
    pw_chk: '',
    email: '',
    phone: '',
    addr: '',
    birthday: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  useEffect(() => {
    getData();
  },[]);

  const getData = (params) => {
    axiosInstance
    .post("/users/getUserInfo", JSON.stringify(form))
    .then((res) => {
      setForm({ ...res.data[0]});
    })
    .catch((error) => console.error("Error fetching data:", error));    
  };

  const apply = (params) => {
    if (form.pw !== form.pw_chk) {
      modalRef2.current.open({ title:"알림", message:"비밀번호가 일치하지 않습니다.", cancelText:""});
      return;
    }

    axiosInstance
      .post("/users/setUserInfo", JSON.stringify(form))
      .then((res) => {
        modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:""});
      })
      .catch((error) => console.error("Error fetching data:", error));    
  };

 
  return (
    <div style={MainContentStyle}>

      <div className="p-2 mb-2 border bg-light">
     
        <Row className="">
          <Col className="d-flex gap-2 align-items-center">
            <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }}>
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">아이디</th>
                  <td>
                    <Form.Control 
                      type="text"
                      name="user_id"
                      value={form.user_id ?? ''}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                      disabled
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">이름</th>
                  <td>
                    <Form.Control 
                      type="text"
                      name="user_nm"
                      value={form.user_nm ?? ''}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                      disabled
                    />
                  </td>
                </tr>
    
                <tr>
                  <th className="bg-light text-end align-middle">비밀번호</th>
                  <td>
                    <Form.Control 
                      type="password"
                      name="pw"
                      value={form.pw ?? ''}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>
                </tr>
    
                <tr>
                  <th className="bg-light text-end align-middle">비밀번호 확인</th>
                  <td>
                    <Form.Control 
                      type="password"
                      name="pw_chk"
                      value={form.pw_chk ?? ''}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>
                </tr>
    
                
                <tr>
                  <th className="bg-light text-end align-middle">이메일</th>
                  <td>
                    <Form.Control 
                      type="text"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>
                </tr>
                
                <tr>
                  <th className="bg-light text-end align-middle">연락처</th>
                  <td>
                    <Form.Control
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">주소</th>
                  <td>
                    <Form.Control
                      type="text"
                      name="addr"
                      value={form.addr}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>
                </tr>
                <tr>
                  <th className="bg-light text-end align-middle">생년월일</th>
                  <td>
                    <Form.Control
                      type="date"
                      name="birthday"
                      value={form.birthday}
                      onChange={handleChange}
                      size="sm" 
                      className="w-auto"
                      maxLength={50}
                    />
                  </td>
                </tr>
                
              </tbody>
            </Table>
            
            
          </Col>
        </Row>

        <Row className="">
          <Col className="d-flex gap-2 align-items-center">
            
            <Button size="sm" variant="secondary" onClick={apply}>적용</Button>
          </Col>
        </Row>
      
      </div>


      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
    </div>
  );
}

export default MyPage;
