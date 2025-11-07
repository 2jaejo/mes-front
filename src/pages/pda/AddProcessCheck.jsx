import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

import axiosInstance from "utils/Axios";
import Modal from "components/Modal";
import dayjs from "dayjs";

import { MainContentStyle, MainContentStyle2 } from "css/CommonStyle";
import SearchableDropdown from "components/SearchableDropdown";

// 추가 모달 컴포넌트
const Main = ({ form={} }) => {

  const modalRef = useRef();  
  const modalRef2 = useRef();  

  const [modalForm, setModalForm] = useState(form);

  const modalFormChange = (e) => {
    const { name, value } = e.target;
    setModalForm(prev => ({ ...prev, [name]: value }));
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


    const [options3, setOptions3] = useState([]);
    const [selectedName3, setSelectedName3] = useState('');
    const [selectedValue3, setSelectedValue3] = useState('');

    const handleSelect3 = (option, type="sel") => {
      setSelectedName3(option.name);
      setSelectedValue3(option.value);
      modalFormChange({target:{name:'chk_user', value:option.user_nm}});
    };

    useEffect(()=>{
      axiosInstance
        .post(`/users/getUsers`, JSON.stringify({grade:'8'}))
        .then((res) => {
          
          const newData = res.data.map(el => ({
            ...el,
            name : `[${el.user_id}] ${el.user_nm}`,
            value: `${el.user_nm}`
          }));
          
          setOptions3(newData);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
        })
        .finally(() =>{
          // setBarcode('');

        });

    },[]);


  const addData = (params) => {
    console.log("addData");
    console.log(modalForm);

    if(modalForm.chk_date === "" || modalForm.chk_date === undefined || modalForm.chk_time === "" || modalForm.chk_time === undefined){
      modalRef2.current.open({ title:"알림", message:"검사일시를 입력하세요.", cancelText:"" });
      return;
    }

    if(modalForm.chk_process_code === "" || modalForm.chk_process_code === undefined){
      modalRef2.current.open({ title:"알림", message:"공정을 선택하세요.", cancelText:"" });
      return;
    }

    if(modalForm.chk_user === "" || modalForm.chk_user === undefined){
      modalRef2.current.open({ title:"알림", message:"검사자를 선택하세요.", cancelText:"" });
      return;
    }

    if(modalForm.chk_item_code === "" || modalForm.chk_item_code === undefined){
      modalRef2.current.open({ title:"알림", message:"제품을 선택하세요.", cancelText:"" });
      return;
    }

    // 폼 초기화
    modalRef.current.open({
      title: "기록 추가",
      message: "추가 하시겠습니까?",
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"추가",
      confirmClass:"btn btn-success",
      onConfirm: (res) => {
        
        
        modalRef.current.update({ isLoading: true });

        axiosInstance
          .post(`/api/addChkProcess`, JSON.stringify(modalForm))
          .then((res) => {
            setModalForm({
              chk_date: '',
              chk_time: '',
              chk_status: '',
              chk_remarks: '',

              temp_water: '',
              temp_die1: '',
              temp_die2: '',
              temp_barrel1: '',
              temp_barrel2: '',
              temp_barrel3: '',
              speed_screw: '',
              speed_out: '',
              speed_cut: '',
              interval_dies: '',

            });

        

            handleSelect({name:'제품 선택', value:'', item_dotno:''});
            handleSelect2({name:'공정 선택', value:'', process_name:''});
            handleSelect3({name:'사용자 선택', value:'', user_nm:''});

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

  


  return (
    <Container fluid className="p-0" style={{ minHeight: "87vh"}}>
      <Modal ref={modalRef} />
      <Modal ref={modalRef2} />


      <Table bordered style={{ width: '100%', tableLayout: 'auto', overflow:'auto' }} className="m-0">
        <tbody>
          <tr>
            <th className="bg-light text-end align-middle">날짜</th>
            <td>
              <Form.Control 
                type="date"
                name="chk_date"
                value={modalForm.chk_date ?? ''}
                onChange={modalFormChange}
                size="sm" 
                className="w-100"
                maxLength={1}
              />
            </td>
          </tr>

          <tr>
            <th className="bg-light text-end align-middle">시간</th>
            <td>
              <Form.Control 
                type="time"
                name="chk_time"
                value={modalForm.chk_time ?? ''}
                onChange={modalFormChange}
                size="sm" 
                className="w-100"
                maxLength={1}
              />
            </td>
          </tr>

          <tr>
            <th className="bg-light text-end align-middle">제품</th>
            <td>
              <SearchableDropdown
                options={options}
                selected={selectedName}
                onSelect={handleSelect}
                title={"제품 선택"}
                size="sm"
              />
            </td>
          </tr>

          <tr>
            <th className="bg-light text-end align-middle">공정</th>
            <td>
              <SearchableDropdown
                options={options2}
                selected={selectedName2}
                onSelect={handleSelect2}
                title={"공정 선택"}
                size="sm"
              />
            </td>
          </tr>

          <tr>
            <th className="bg-light text-end align-middle">검사자</th>
            <td>
              <SearchableDropdown
                options={options3}
                selected={selectedName3}
                onSelect={handleSelect3}
                title={"검사자 선택"}
                size="sm"
              />
            </td>
          </tr>

          <tr>
            <th className="bg-light text-end align-middle">비고</th>
            <td>
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
          </tr>

          <tr>
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
          </tr>

          <tr>
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
          </tr>

          <tr>            
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
          </tr>

          <tr>
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
          </tr>

          <tr>
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
            <th className="bg-light text-end align-middle">에어플로우메타(lpm)</th>
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
          </tr>
        </tbody>
      </Table>

      <div className="my-2 d-flex gap-2 justify-content-center align-items-center">
        <Button style={{width:"7rem", height:"4rem", fontSize:"1rem"}} variant="success" onClick={addData}>추가</Button>
      </div>
    </Container>
  );
};

export default Main;
