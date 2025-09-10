import React, { useState, useEffect, useRef } from "react";
import { Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import GridExample from "components/GridExample";
import Modal from "components/Modal";

import dayjs from "dayjs";

import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import SearchableDropdown from "components/SearchableDropdown";

const Main = () => {
  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [barcode, setBarcode] = useState('');

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      const params = {
        barcode: barcode,
      }

      setLoading(true);
      axiosInstance
        .post(`/api/getRaw`, JSON.stringify(params))
        .then((res) => {
          setRowData(res.data);
          
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          setLoading(false);
          setBarcode('');

        });
      
    }

  };

  // selectbox
  const selectBox = useRef({}); 

  // 검색창 입력필드
  const [form, setForm] = useState({
    start_date: '',
    end_date: '',
    item_code:'',
    item_name:'',
  });

  // 검색창 입력필드 변경 저장
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  }; 



  
  // 그리드 설정
  const gridRef = useRef();  
  const [rowData, setRowData] = useState();
  const [columnDefs, setColumnDefs] = useState([]);
  const [loading, setLoading] = useState(false);

  // 그리드 onGridReady
  const onGridReady = (params) => {
    gridRef.current = params.api; // Grid API 저장

    // 행 클릭 이벤트
    params.api.addEventListener("rowClicked", (ev) => {
      
    });

    // 셀 값 변경 이벤트
    params.api.addEventListener("cellValueChanged", (ev) => {
      console.log("cellValueChanged");
      
    });

    
    // 선택 변경 이벤트
    params.api.addEventListener("selectionChanged", (ev) => {
      console.log("selectionChanged");
      
      const selectedRows = params.api.getSelectedRows();
      console.log(selectedRows);
    });

  };

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



  // 초기화 selectbox list
  useEffect(()=>{
    console.log("useEffect");

    const init = {
      code: ['cd017', 'cd019']
    };

    axiosInstance
    .post(`/api/getDropDown`, JSON.stringify(init))
    .then((res) => {
      selectBox.current = res.data;
    
      setColumnDefs([
        { headerName: "검사일", field: "chk_date", align:"center" },
        { headerName: "검사시간", field: "chk_time", align:"center" },
        { headerName: "품명", field: "item_name", align:"left", minWidth:300 },
        { headerName: "공정", field: "process_name", align:"center" },
        { headerName: "비고", field: "chk_remarks", align:"left", width:300 },

        { headerName: "냉각수 온도(℃)", field: "temp_water", sortable:false, align:"right"},
        { headerName: "다이1 온도(℃)", field: "temp_die1", sortable:false, align:"right"},
        { headerName: "다이2 온도(℃)", field: "temp_die2", sortable:false, align:"right"},
        { headerName: "배럴1 온도(℃)", field: "temp_barrel1", sortable:false, align:"right"},
        { headerName: "배럴2 온도(℃)", field: "temp_barrel2", sortable:false, align:"right"},
        { headerName: "배럴3 온도(℃)", field: "temp_barrel3", sortable:false, align:"right"},
        { headerName: "스크류 속도(rpm)", field: "speed_screw", sortable:false, align:"right", width:120},
        { headerName: "인출기 속도(rpm)", field: "speed_out", sortable:false, align:"right", width:120},
        { headerName: "컷팅기 속도(rpm)", field: "speed_cut", sortable:false, align:"right", width:120},
        { headerName: "다이스 간격(mm)", field: "interval_dies", sortable:false, align:"right", width:120},
        
        { headerName: "등록일", field: "created_at", align:"center", width:120 },
        { headerName: "등록자", field: "created_by", align:"left" },
      ]);

      getData();

    })
    .catch((error) => {
      console.error("Error fetching data:", error);
      modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
    });    

  },[]);


  

  // 추가 모달 기본값
  const DEFAULT_FORM = (init={}) => ({
      chk_date : ''
    , chk_time : ''
    , chk_process_code : ''
    , chk_item_code : ''
    , chk_remarks : ''
    , temp_water : ''
    , temp_die1 : ''
    , temp_die2 : ''
    , temp_barrel1 : ''
    , temp_barrel2 : ''
    , temp_barrel3 : ''
    , speed_screw : ''
    , speed_out: ''
    , speed_cut: ''
    , interval_dies: ''
    , ...init
  });

  // 추가 모달 입력필드 저장
  const formRef = useRef();

  // 추가 모달 입력필드 변경
  const formRefChange = (name, value) => {
    formRef.current[name] = value;
  };

  // 추가 모달 컴포넌트
  const ModalForm = ({ form={}, onChangeHandler }) => {
    console.log("ModalForm");

    const [modalForm, setModalForm] = useState(form);

    const modalFormChange = (e) => {
      const { name, value } = e.target;
      setModalForm(prev => ({ ...prev, [name]: value }));
      onChangeHandler(name, value);
    };

    const [options, setOptions] = useState([]);
    const [selectedName, setSelectedName] = useState('');
    const [selectedValue, setSelectedValue] = useState('');
    const handleSelect = (option, type="sel") => {
      setSelectedName(option.name);
      setSelectedValue(option.value);
      modalFormChange({target:{name:'chk_item_code', value:option.item_dotno}});
    };

    useEffect(()=>{
      axiosInstance
        .post(`/api/getItem`, JSON.stringify())
        .then((res) => {
          
          const newData = res.data.map(el => ({
            ...el,
            name : `[${el.item_dotno}] ${el.item_name}`,
            value: `${el.item_dotno}`
          }));
          
          setOptions(newData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          // setBarcode('');

        });

    },[]);

    const [options2, setOptions2] = useState([]);
    const [selectedName2, setSelectedName2] = useState('');
    const [selectedValue2, setSelectedValue2] = useState('');
    const handleSelect2 = (option, type="sel") => {
      setSelectedName2(option.name);
      setSelectedValue2(option.value);
      modalFormChange({target:{name:'chk_process_code', value:option.process_code}});
    };

    useEffect(()=>{
      axiosInstance
        .post(`/api/getProcess`, JSON.stringify({}))
        .then((res) => {
          
          const newData = res.data.map(el => ({
            ...el,
            name : `${el.process_name}`,
            value: `${el.process_code}`
          }));
          
          setOptions2(newData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          // setBarcode('');

        });

    },[]);

    


    return (
      <div style={{ height: '46vh', width:'50vw', display: 'flex', flexDirection: 'column'}}>
        <Table bordered style={{ width: '100%', tableLayout: 'auto', overflow:'auto' }} className="m-0">
          <tbody>
            <tr>
              <th className="bg-light text-end align-middle">기록일시</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="date"
                    name="chk_date"
                    value={modalForm.chk_date ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={1}
                  />
                  <Form.Control 
                    type="time"
                    name="chk_time"
                    value={modalForm.chk_time ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={1}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">제품</th>
              <td colspan="3">
                <SearchableDropdown
                  options={options}
                  selected={selectedName}
                  onSelect={handleSelect}
                  title={"제품 선택"}
                  size="sm"
                />
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">공정</th>
              <td colspan="3">
                <SearchableDropdown
                  options={options2}
                  selected={selectedName2}
                  onSelect={handleSelect2}
                  title={"공정 선택"}
                  size="sm"
                />
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">비고</th>
              <td colspan="3">
                <Form.Control 
                  type="text"
                  name="chk_remarks"
                  value={modalForm.chk_remarks ?? ''}
                  onChange={modalFormChange}
                  size="sm" 
                  className="w-100"
                  maxLength={100}
                />
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">냉각수 온도(℃)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="temp_water"
                    value={modalForm.temp_water ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
    
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">다이1 온도(℃)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="temp_die1"
                    value={modalForm.temp_die1 ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle">다이2 온도(℃)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="temp_die2"
                    value={modalForm.temp_die2 ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
            </tr>
            <tr>
              <th className="bg-light text-end align-middle">배럴1 온도(℃)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="temp_barrel1"
                    value={modalForm.temp_barrel1 ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle">배럴2 온도(℃)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="temp_barrel2"
                    value={modalForm.temp_barrel2 ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle">배럴3 온도(℃)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="temp_barrel3"
                    value={modalForm.temp_barrel3 ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">스크류 속도(rpm)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="speed_screw"
                    value={modalForm.speed_screw ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle">인출기 속도(rpm)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="speed_out"
                    value={modalForm.speed_out ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle">컷팅기 속도(rpm)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="speed_cut"
                    value={modalForm.speed_cut ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
            </tr>

            <tr>
              <th className="bg-light text-end align-middle">다이스 간격(mm)</th>
              <td>
                <div className="d-flex gap-2">
                  <Form.Control 
                    type="text"
                    name="interval_dies"
                    value={modalForm.interval_dies ?? ''}
                    onChange={modalFormChange}
                    size="sm" 
                    className="w-100"
                    maxLength={10}
                  />
                </div>
              </td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
              <th className="bg-light text-end align-middle"></th>
              <td></td>
            </tr>

            

          </tbody>
        </Table>
      </div>
    );
  };


  // 조회
  const getData = (params) => {
    console.log("getData");

    setLoading(true);

    axiosInstance
      .post(`/api/getChkProcess`, JSON.stringify(form))
      .then((res) => {
        setRowData(res.data);
        
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);
      });
  };


  


  // 추가
  const addData = (params) => {
    console.log("addData");

    // 폼 초기화
    formRef.current = DEFAULT_FORM();

    modalRef.current.open({
      title: "추가",
      message: "추가 하시겠습니까?",
      content: <ModalForm form={formRef.current} onChangeHandler={formRefChange} />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {

        console.log(formRef.current);

        if(formRef.current.chk_date === "" || formRef.current.chk_date === undefined || formRef.current.chk_time === "" || formRef.current.chk_time === undefined){
          modalRef2.current.open({ title:"알림", message:"기록일시를 입력하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.chk_process_code === "" || formRef.current.chk_process_code === undefined){
          modalRef2.current.open({ title:"알림", message:"공정을 선택하세요.", cancelText:"" });
          return;
        }

        if(formRef.current.chk_item_code === "" || formRef.current.chk_item_code === undefined){
          modalRef2.current.open({ title:"알림", message:"제품을 선택하세요.", cancelText:"" });
          return;
        }
        
        modalRef.current.update({ isLoading: true });
        axiosInstance
          .post(`/api/addChkProcess`, JSON.stringify(formRef.current))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(() => {
            modalRef.current.update({ isLoading: false });
          });

        

        
      }, 
    });

  };


  // 삭제
  const delData = (params) => {
    console.log("delData");
    
    const selectRows = gridRef.current.getSelectedRows();
    
    if(selectRows.length === 0) {
      modalRef.current.open({ title:"알림", message:"선택된 항목이 없습니다.", cancelText:"" });
      return;
    }
    
    // 모달 열기
    modalRef.current.open({
      title:"삭제",
      message:`선택된 행을 삭제하시겠습니까?`,
      confirmText:"삭제",
      confirmClass:"btn btn-danger",
      onCancel:()=>{
        modalRef.current.close();
      },
      onConfirm:(res) => {
        
        axiosInstance
          .post(`/api/delChkProcess`, JSON.stringify(selectRows))
          .then((res) => {
            getData();
            modalRef.current.close();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef.current.close();
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          });    
 
      },
    });
    
  };


  


  const exportExcel = () =>{
    console.log("exportExcel");
    if (gridRef.current) {
      gridRef.current.exportDataAsCsv({
        fileName: `export_${dayjs().format('YYYYMMDD')}_동일프라텍_공정관리기록.csv`
      });
    }
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
                  <th className="bg-light text-end align-middle">기록일자</th>
                  <td className="">
                    <div className="d-flex gap-2 align-items-center">
                      <Form.Control 
                        type="date"
                        name="start_date"
                        value={form.start_date}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="CODE"
                        maxLength={50}
                      />
                      <span className="fw-bold"> ~ </span>
                      <Form.Control 
                        type="date"
                        name="end_date"
                        value={form.end_date}
                        onChange={handleChange}
                        size="sm" 
                        className="w-auto"
                        placeholder="NAME"
                        maxLength={50}
                      />
                    </div>
                  </td>
                  <th className="bg-light text-end align-middle">품목</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="item_code"
                        value={form.item_code}
                        onChange={handleChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="품번"
                        maxLength={50}
                      />
                      <Form.Control 
                        type="text"
                        name="item_name"
                        value={form.item_name}
                        onChange={handleChange}
                        onKeyUp={(e)=>{if(e.code === 'Enter') getData()}}
                        size="sm" 
                        className="w-auto"
                        placeholder="품명"
                        maxLength={50}
                      />
                    </div>
                  </td>
                  <td className="">
                    <Button size="sm" variant="primary" onClick={getData}><i className="bi bi-search"></i></Button>
                  </td>

                  {/* <th className="bg-light text-end align-middle">바코드</th>
                  <td className="">
                    <div className="d-flex gap-2">
                      <Form.Control 
                        type="text"
                        name="barcode"
                        value={form.barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        onKeyUp={handleKeyPress}
                        size="sm" 
                        className="w-auto"
                        placeholder="바코드를 스캔하세요"
                        maxLength={50}
                      />
                      
                    </div>
                  </td> */}

                </tr>
    
              </tbody>
            </Table>


          </Col>
        </Row>
      </div>

      <div className="h-100">
        <Row  className="h-100">
          <Col className="h-100 d-flex flex-column" xs={12} md={12}>
            <div className="d-flex gap-2 justify-content-start align-items-center">
              <span className="fw-bold my-2">기록 이력</span>
              <Button size="sm" variant="success" onClick={addData}>추가</Button>
              <Button size="sm" variant="danger" onClick={delData}>삭제</Button>
              {/* <Button size="sm" variant="primary" onClick={mappingData}>업로드 맵핑</Button>
              <Button size="sm" variant="primary" onClick={uploadExcel}>파일 업로드</Button> */}
              <Button size="sm" variant="secondary" onClick={exportExcel}>csv 다운로드</Button>
              
            </div>

            <GridExample
              columnDefs={columnDefs}
              rowData={rowData}
              onGridReady={onGridReady} 
              loading={loading}
              rowNum={true}
              rowSel={"singleRow"}
              pagination={true}
            />
          </Col>


        </Row>

      </div>


    </div>
  );
}

export default Main;




