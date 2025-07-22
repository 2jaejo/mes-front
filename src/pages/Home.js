import React, { useState, useRef, useEffect } from "react";

import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import CurrentTime from "../components/Today";
import axiosInstance from "utils/Axios";
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import dayjs from 'dayjs'
import CustomModal from "components/Modal";
import GridExample from "components/GridExample";
import isEqual from 'lodash/isEqual';



const Home = ({isActive, addTab}) => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [chartData, setChartData] = useState([]);
  const chartDataRef = useRef([]); // 최신 chartData를 기억할 ref

  const gridRef = useRef();  
  const [rowData, setRowData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRow, setSelectedRow] = useState(0);   
  
  const gridRef2 = useRef();  
  const [rowData2, setRowData2] = useState([]);
  const [columnDefs2, setColumnDefs2] = useState([]);
  const [loading2, setLoading2] = useState(true);
  const [selectedRow2, setSelectedRow2] = useState(0);   

  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      setSelectedRow(ev.rowIndex); 
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){

      };

    });

  };

  // 그리드 onGridReady2
  const onGridReady2 = (params) => {
    gridRef2.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      console.log("rowClicked");
      
      setSelectedRow2(ev.rowIndex); 
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = ev.api.getSelectedRows();
      if( ev.source !== 'rowDataChanged' && selectedRows.length > 0 ){

      };

    });

  };



  // selectbox
  const selectBox = useRef({}); 

  // grid cell code_name 변환
  const commonTypeFormatter = (params, cd) => {
    const arr_client_type = selectBox.current.common?.[cd] || [];
    const item = arr_client_type.find(el => el.code === params.value);
    return item ? item.code_name : params.value; 
  };

  // 초기화
  useEffect(()=>{
    console.log("useEffect");
    
    if( !isActive ) return;

    const init = {
      category: '',
      code: ['cd011', 'cd016']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;

      // 설비목록 그리드 설정
      setColumnDefs([
        { headerName: "공정코드", field: "process_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:150 },
        { headerName: "공정명", field: "process_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:200 },
        { headerName: "공정유형", field: "process_type", sortable: true, editable: false, align:"center", width:150, 
          valueFormatter:(params)=> commonTypeFormatter(params,'cd011')
        },
        { headerName: "할당 품번", field: "item_code", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:300 },
        { headerName: "할당 품명", field: "item_name", sortable: true, editable: false, align:"left", filter: "agTextColumnFilter", width:300, flex:1 },
        { headerName: "작업 상태", field: "status", sortable: true, editable: false, align:"center", width:150,
          cellEditor: "agSelectCellEditor",
          cellEditorParams: {
            values: selectBox.current.common?.['cd016']?.map((item) => item.code) ?? [],
          },
          valueFormatter: (params) => commonTypeFormatter(params, 'cd016'),
        },
        
      ]);

      // 생산완료 그리드 설정
      setColumnDefs2([
        // { headerName: "바코드", field: "bar_code", sortable: true, editable: false, align:"left",width:200},
        { headerName: "품번", field: "item_dotno", sortable: true, editable: false, align:"left",width:300},
        { headerName: "품명", field: "item_name", sortable: true, editable: false, align:"left",width:500},
        { headerName: "완료수량", field: "quantity", sortable: true, editable: false, align:"right",width:140},
        { headerName: "비고", field: "remark", sortable: true, editable: false, align:"left"}, 
        { headerName: "등록일자", field: "created_at", sortable: true, editable: false, align:"left"},
        { headerName: "등록자", field: "created_by", sortable: true, editable: false, align:"left"},
        { headerName: "수정일자", field: "updated_at", sortable: true, editable: false, align:"left"},
        { headerName: "수록자", field: "updated_by", sortable: true, editable: false, align:"left"},
      ]);

      getData();
      getData2();
      getData3();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });  
      
  },[isActive]);


  useEffect(() => {
    const intervalId = setInterval(() => {
      refresh();
    }, 5000); // 5초마다 실행

    // 언마운트 시 인터벌 해제
    return () => clearInterval(intervalId);
  }, []);



  const refresh = () => {
    console.log("refresh");
    getData();
    getData2();
    getData3();
  };

  //조회3
  const getData3 = async () =>{
    console.log("getData3");

    const data = {
      today: dayjs().format("YYYY-MM-DD"),
      // today: '2025-07-15'
    };

    // setLoading2(true);
    // setRowData2([]);

    axiosInstance
      .post(`/api/getProductionLog`, JSON.stringify(data))
      .then((res) => {

        if (!res || !res.data) {
          throw new Error('응답 데이터가 없습니다.');
        }
        
        // 기존 상태와 비교
        if (!isEqual(rowData2, res.data)) {
          setRowData2(res.data);
        }

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"", autoCloseDelay: 2000 });
      })
      .finally(() =>{
        setLoading2(false);
      });
  };

  // 조회2
  const getData2 = (params) => {
    console.log("getData2");

    // setLoading(true);
    // setRowData([]);

    axiosInstance
      .post(`/api/getProcess`, JSON.stringify({type:"status"}))
      .then((res) => {  

        if (!res || !res.data) {
          throw new Error('응답 데이터가 없습니다.');
        }

        if(res.data.length === 0) return;

        const rows = res.data;
        // const newData = [];
        const newData = rows.filter( (el) => el.process_type !=='03' && el.item_code !== null);
        setRowData(newData);

        // 기존 상태와 비교
        if (!isEqual(rowData, newData)) {
          setRowData(newData);
        }

      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"", autoCloseDelay: 2000});
      })
      .finally(() =>{
        setLoading(false);

        // let sel = selectedRow;
        // if(typeof params === "number") sel = params;
        // gridRef.current.forEachNode((node) => {
        //   if (node.rowIndex === sel) {
        //     node.setSelected(true);
        //   }
        // });
      });
    
  };

  // chartData가 바뀔 때마다 ref도 업데이트
  useEffect(() => {
    chartDataRef.current = chartData;
  }, [chartData]);


  // 조회
  const getData = (params) => {
    console.log("getData");
    
    const data = {
      date: dayjs().format("YYYY-MM-DD")
      // date: '2025-07-16'
    };

    axiosInstance
      .post(`/api/getReportProcess`, JSON.stringify(data))
      .then((res) => {
        if (!res || !res.data) {
          throw new Error('응답 데이터가 없습니다.');
        }

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
            'item_code':el.item_code,
            'process_code':el.process_code,

          })
        });

        // 기존 상태와 비교
        if (!isEqual(chartData, newData)) {
          setChartData(newData); 

        }


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:error.code, message:error.message, cancelText:"", confirmClass:"btn btn-danger", autoCloseDelay: 2000 });
      })
      .finally(() =>{
        
      });
    
  };



  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div key={label} style={{ background: '#fff', border: '1px solid #ccc', padding: '4px' }}>
          <span><strong>{label}</strong></span><br/>
          {payload.map((entry, index) => {
            return (
              <div key={index}>
                <span style={{ color: entry.color }}>
                  ● {entry.name}: {entry.value}
                </span>
              </div>
            );
          })}

          {/* 추가 정보 예시 */}
          <br/>
          <span>{data['item_code'] ?? ""}</span>
          <br/>
          <span>{data['item_name'] ?? ""}</span>
        </div>
      );
    }
    return null;
  };
  

  const ExampleBarChart = () => {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={chartData}
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
      <CustomModal ref={modalRef} />
      <CustomModal ref={modalRef2} />
      
      {/* 날짜 영역 */}
      <Row>
        <Col>
          <Card bg="secondary" text="white">
            <Card.Body>
              <div className="d-flex justify-content-center align-items-center gap-4">
                {/* <div className="">
                </div>
                <div className="d-flex gap-4"> */}
                  <h2>종합 현황</h2>
                  <h3><CurrentTime /></h3>
                  <Button size="lg" variant="secondary" onClick={refresh}><i className="bi bi-arrow-clockwise"></i></Button>
                {/* </div>
                <div className="">
                </div> */}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 상단1 영역 */}
      <Row style={{ height: '100%', minHeight:400 }}>
        <Col md={12} className="">
          <Card bg="" text="" style={{ height: '100%' }}>
            <Card.Header>
              <Card.Title className="m-0 d-flex justify-content-between">
                공정 가동 현황
                <i className="bi bi-box-arrow-up-right" title="공정별현황 열기" style={{ cursor: "pointer" }} onClick={()=>{addTab('EquipmentStatusByUnit', '공정별현황')}}></i>  
              </Card.Title>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="h-100">
                <GridExample 
                  themeSize="md"
                  columnDefs={columnDefs}
                  rowData={rowData}
                  onGridReady={onGridReady} 
                  // loading={loading}
                  rowNum={true}
                  rowSel={"singleRow"}
                  pagination={false}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 하단 2 영역 */}
      <Row style={{ height: '100%' }} className='g-2'>
        <Col sm={12} md={6}>
          <Card bg="" text="" style={{ height: '100%', minHeight:300 }}>
            <Card.Header>
              <Card.Title className="m-0">생산 완료 현황</Card.Title>
            </Card.Header>
            <Card.Body className="p-0 h-100">
              <div className="h-100">
                <GridExample 
                  themeSize="md"
                  columnDefs={columnDefs2}
                  rowData={rowData2}
                  onGridReady={onGridReady2} 
                  // loading={loading2}
                  rowNum={true}
                  rowSel={"singleRow"}
                  pagination={false}
                />

              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col sm={12} md={6}>
          <Card bg="" text="" style={{ height: '100%' }}>
            <Card.Header>
              <Card.Title className="m-0 d-flex justify-content-between">
                일일 생산 현황 
                <i className="bi bi-box-arrow-up-right" title="성능가동률 열기" style={{ cursor: "pointer" }} onClick={()=>{addTab('PerformanceOperationRate', '성능가동률')}}></i>
              </Card.Title>
            </Card.Header>
            <Card.Body className="p-2 d-flex flex-column justify-content-center">
              <div style={{width:"100%", minHeight:270, maxHeight:300, overflow:'auto'}}>
                <ExampleBarChart />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Home;
