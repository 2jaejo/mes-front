import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import CurrentTime from "../components/Today";

const Home = () => {
  const today = '2025.02.04';

  return (
    <div style={MainContentStyle}>
      
      {/* 날짜 영역 */}
      <Row>
        <Col>
          <Card bg="dark" text="white">
            <Card.Body>
              <div className="d-flex justify-content-center align-items-center gap-2">
                <h1>종합 현황</h1>
                <h2><CurrentTime /></h2>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 상단1 영역 */}
      <Row style={{ height: '50%' }}>
        <Col md={12} className="">
          <Card bg="secondary" text="white" style={{ height: '100%' }}>
            <Card.Body className="p-2">
              <Card.Title>라인 가동 현황</Card.Title>
              {/* 여기에 가동현황 테이블 컴포넌트 삽입 */}
              <div>가동현황 테이블 영역</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 하단 2 영역 */}
      <Row style={{ height: '40%' }} className='g-2'>
        <Col sm={12} md={6}>
          <Card bg="secondary" text="white" style={{ height: '100%' }}>
            <Card.Body>
              <Card.Title>라인 가동 현황</Card.Title>
              {/* 여기에 가동현황 테이블 컴포넌트 삽입 */}
              <div>가동현황 테이블 영역</div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6}>
          <Card bg="secondary" text="white" style={{ height: '100%' }}>
            <Card.Body>
              <Card.Title>일별 생산 현황</Card.Title>
              {/* 여기에 생산차트 컴포넌트 삽입 */}
              <div>생산차트 영역</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Home;
