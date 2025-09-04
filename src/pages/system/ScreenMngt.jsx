import React, { useState, useRef, useContext } from "react";

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';
import { ThemeContext } from "utils/ThemeContext";
import { MainContentStyle } from "css/CommonStyle";

const ScreenMngt = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  
  
  const { theme, setTheme } = useContext(ThemeContext);
  const [color, setColor] = useState(theme.color);
  const [color2, setColor2] = useState(theme.bgColor);

  const [isLoading, setIsLoading] = useState(false);

  const update = (params) => {
    let data = {
      color: color,
      bgColor: color2,
    };

    setIsLoading(true);
    axiosInstance
      .post("/users/setTheme", JSON.stringify(data))
      .then((res) => {
        modalRef.current.open({ title:"알림", message:"적용되었습니다.", cancelText:""});
        setTheme({ color: color, bgColor: color2 });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

 
  return (
    <div style={MainContentStyle}>

      <div className="p-2 mb-2 border bg-light">
     
        <Row className="">
          <Col className="d-flex gap-2 align-items-center">
          <Table bordered hover style={{ width: 'auto', tableLayout: 'auto' }}>
              <tbody>
                <tr>
                  <th className="bg-light text-end align-middle">메뉴바 글자색</th>
                  <td>
                    <Form.Control 
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      style={{ width:'30px', height: '30px', padding: 0,  border: '1px solid #ccc' }} 
                    />
                  </td>
                </tr>
                
                <tr>
                  <th className="bg-light text-end align-middle">메뉴바 배경색</th>
                  <td>
                    <Form.Control 
                      type="color"
                      value={color2}
                      onChange={(e) => setColor2(e.target.value)}
                      style={{ width:'30px', height: '30px', padding: 0,  border: '1px solid #ccc' }} 
                    />
                  </td>
                </tr>
              </tbody>
            </Table>
            
          </Col>
        </Row>

        <Row className="">
          <Col className="d-flex gap-2 align-items-center">
       
            <Button size="sm" variant="secondary" onClick={update} disabled={isLoading}>
              {isLoading ? (
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
              ) : null}
              적용
            </Button>

          </Col>
        </Row>
      
      </div>


      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />
    </div>
  );
}

export default ScreenMngt;
