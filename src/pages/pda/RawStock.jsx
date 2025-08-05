import { useState, useRef } from "react"
import { Container, Card, Form, Button, Row, Col, ListGroup, Badge, Modal, Alert, Spinner } from "react-bootstrap"
import axiosInstance from "utils/Axios";
import CustomModal from "components/Modal";
import SearchOrderComponent from "components/SearchOrderComponent";
import SearchVendorComponent from "components/SearchVendorComponent";

const Main = ({ form }) => {
  const modalRef = useRef();  
  const modalRef2 = useRef();
  
  const formRef = useRef();
  const formRef2 = useRef();

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    purchase_id: "",
    client_code: "",
    client_name: "",
    receipt_date: new Date().toISOString().split("T")[0],
    comment: "",
  })

  // 폼 데이터 변경 핸들러
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if(name === 'purchase_id'){
      setFormData((prev) => ({
        ...prev,
        ['client_code']: '',
        ['client_name']: '',
      }));
    }
  }


  // 품목 데이터 상태
  const [items, setItems] = useState([])
  const [selectedItems, setSelectedItems] = useState([])

  // 모달 상태
  const [showClientModal, setShowClientModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)


  // 로딩 상태
  const [loading, setLoading] = useState(false)


  const [barcode, setBarcode] = useState('');

  const handleKeyPress = async (e) => {
    if (e.key === 'Enter' && barcode.trim() !== '') {
      
      getData();
    }

  };

  const getData = async () =>{
    setLoading(true);

    const params = {
      barcode: barcode,
    }

    axiosInstance
      .post(`/api/getRaw`, JSON.stringify(params))
      .then((res) => {
        // setRowData(res.data);
        
        if( res.data.length === 1 ){
          handleItemAdd(res.data[0]);          
        }
        else{
          modalRef.current.open({ title:"알림", message:"유효하지 않은 바코드입니다.", cancelText:"" });
        }


      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        modalRef.current.open({ title:"오류", message:error.message, cancelText:"" });
      })
      .finally(() =>{
        setLoading(false);
        setBarcode('');

      });
  };


  // 금액 포맷터
  const formatMoney = (amount) => {
    if (!amount) return "0"
    return Number(amount).toLocaleString("ko-KR")
  }

  // 품목 수량/단가 변경
  const handleItemChange = (index, field, value) => {
    const newItems = [...items]
    newItems[index][field] = value

    // 합계 자동 계산
    if (field === "quantity" || field === "unit_price") {
      const quantity = Number(newItems[index].quantity) || 0
      const unitPrice = Number(newItems[index].unit_price) || 0
      newItems[index].total_price = quantity * unitPrice
    }

    setItems(newItems)
  }

  // 품목 선택/해제
  const toggleItemSelection = (index) => {
    setSelectedItems((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((_, index) => index))
    }
  }

  // 선택된 품목 삭제
  const deleteSelectedItems = () => {
    if (selectedItems.length === 0) {
      return
    }

    const newItems = items.filter((_, index) => !selectedItems.includes(index))
    setItems(newItems)
    setSelectedItems([])
  }

  // 발주 조회 모달
  const handleOrderSearch = () => {
    // setShowOrderModal(true)
    formRef.current = {
      client_code: "",
      client_name: "",
      start_date: "",
      end_date: "",
      purchase_id: "",
      purchase_status: "",
      use_yn: 'Y',
      sel_row:[],
      sel_row2:[],
    };

    console.log();

    modalRef.current.open({
      title: "발주 조회",
      content: <SearchOrderComponent props={formRef}  />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        

        const row = formRef.current.sel_row;
        const row2 = formRef.current.sel_row2;
        row2.some ((el) =>{
          el.quantity2 = el.quantity;
        })
        handleFormChange({target:{name:"purchase_id", value:row.purchase_id}});
        handleFormChange({target:{name:"client_code", value:row.client_code}});
        handleFormChange({target:{name:"client_name", value:row.client_name}});

        setItems(row2);
        modalRef.current.close();

      }, 
    });
  }


  const handleOrderSelect = () => {
    const selectedOrder = {
      purchase_id: "P001",
      client_code: "C001",
      client_name: "삼성전자",
    }

    const orderItems = [
      {
        raw_code: "R001",
        raw_name: "철강재",
        base_unit: "KG",
        unit_size: '20KG',
        quantity: 10,
        unit_price: 1000,
        total_price: 10000,
      },
      {
        raw_code: "R002",
        raw_name: "알루미늄",
        base_unit: "KG",
        unit_size: '20KG',
        quantity: 5,
        unit_price: 2000,
        total_price: 10000,
      },
    ]

    setFormData((prev) => ({
      ...prev,
      purchase_id: selectedOrder.purchase_id,
      client_code: selectedOrder.client_code,
      client_name: selectedOrder.client_name,
    }))

    setItems(orderItems)
    setShowOrderModal(false)
  }



  // 거래처 조회 모달
  const handleClientSearch = () => {
    // setShowClientModal(true)

    formRef2.current = {
      client_code:'',
      client_name:'',
      client_type:'매입처',
      use_yn: 'Y',
      sel_row:[],
    };

    console.log();

    modalRef.current.open({
      title: "매입처 조회",
      content: <SearchVendorComponent props={formRef2}  />,
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"확인",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        
        const row = formRef2.current.sel_row;
        handleFormChange({target:{name:"client_code", value:row.client_code}});
        handleFormChange({target:{name:"client_name", value:row.client_name}});
        modalRef.current.close();

      }, 
    });
  }

  const handleClientSelect = () => {
    const selectedClient = {
      client_code: "C001",
      client_name: "삼성전자",
    }

    setFormData((prev) => ({
      ...prev,
      client_code: selectedClient.client_code,
      client_name: selectedClient.client_name,
      purchase_id: "", // 거래처 변경 시 발주번호 초기화
    }))

    setItems([]) // 품목 목록 초기화
    setShowClientModal(false)
  }


 
  // 품목 추가
  const handleItemAdd = (params) => {
    const newItem = {...params};

    // 중복 체크
    const exists = items.some((item) => item.raw_code === newItem.raw_code)
    if (exists) {
      modalRef.current.open({ title:"알림", message:"이미 추가된 품목입니다.", cancelText:"" });
      return
    }

    setItems((prev) => [...prev, newItem])
    setShowItemModal(false)
  }

  

  // 저장 처리
  const handleSave = () => {
    // 유효성 검사
    if (!formData.client_code) {
      modalRef.current.open({ title:"알림", message:"거래처를 선택해주세요.", cancelText:"" });
      return
    }

    if (items.length === 0) {
      modalRef.current.open({ title:"알림", message:"입고할 품목을 추가해주세요.", cancelText:"" });
      return
    }

    modalRef.current.open({
      title: "저장",
      content: "저장하시겠습니까?",
      onCancel: ()=>{
        modalRef.current.close();
      },
      confirmText:"저장",
      confirmClass:"btn btn-primary",
      onConfirm: (res) => {
        
        const emptyFields = items.filter(item => {
          return (
            !item.quantity || item.quantity === '' ||
            !item.unit_price || item.unit_price === ''
          );
        });

        if (emptyFields.length > 0) {
          modalRef.current.close();
          modalRef2.current.open({ title:"알림", message:"수량 또는 단가 항목이 비어 있습니다.", cancelText:"" });
          return;
        }

        const newData = {
          ...formData,
          sel_row:items
        };
        console.log(newData);

        modalRef.current.close();
        setLoading(true);

        axiosInstance
          .post(`/api/addReceipt`, JSON.stringify(newData))
          .then((res) => {
            modalRef2.current.open({ title:"알림", message:"입고 되었습니다.", cancelText:"" });
            resetForm();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
            modalRef2.current.open({ title:"알림", message:error.message, cancelText:"" });
          })
          .finally(()=>{
            setLoading(false);

          });
          
      }, 
    });

  }

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      purchase_id: "",
      user_id: "",
      user_nm: "",
      client_code: "",
      client_name: "",
      receipt_date: new Date().toISOString().split("T")[0],
      comment: "",
    })
    setItems([])
    setSelectedItems([])
  }

  // 폼 초기화2
  const resetForm2 = () => {
    setFormData({
      purchase_id: "",
      user_id: "",
      user_nm: "",
      client_code: "",
      client_name: "",
      receipt_date: new Date().toISOString().split("T")[0],
      comment: "",
    })
    
  }


  // 총 합계 계산
  const totalAmount = items.reduce((sum, item) => sum + (item.total_price || 0), 0)


  return (
    <Container fluid className="p-0" style={{ minHeight: "87vh"}}>

      <CustomModal ref={modalRef} />
      <CustomModal ref={modalRef2} />

      {/* 기본 정보 카드 */}
      <Card className="shadow-sm">
        {/* <Card.Header className="bg-primary text-white">
          <h6 className="mb-0">
            <i className="bi bi-clipboard-data me-2"></i>
            입고 정보
          </h6>
        </Card.Header> */}

        <Card.Body>
          {/* 발주번호 */}
          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">발주번호</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                name="purchase_id"
                value={formData.purchase_id}
                onChange={handleFormChange}
                placeholder=""
                maxLength={50}
              />
              <Button variant="primary" onClick={handleOrderSearch}>
                <i className="bi bi-search"></i>
              </Button>
            </div>
          </div>

          {/* 거래처 */}
          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">거래처</Form.Label>
            {/* <div className="d-flex gap-2 mb-2">
              <Form.Control
                type="text"
                name="client_code"
                value={formData.client_code}
                placeholder="거래처 코드"
                maxLength={50}
                disabled
              />
            </div> */}
            <div className="d-flex gap-2">
              <Form.Control 
                type="text" 
                name="client_name" 
                value={formData.client_name} 
                placeholder="" 
                maxLength={50}
                disabled 
              />
              <Button variant="primary" onClick={handleClientSearch}>
                <i className="bi bi-search"></i>
              </Button>
              <Button variant="secondary" onClick={resetForm2}>
                <i className="bi bi-arrow-clockwise"></i>
              </Button>
            </div>
          </div>

          {/* 입고일 */}
          <div className="mb-2">
            <Form.Label className=" mb-0 fw-bold">입고일</Form.Label>
            <Form.Control 
              type="date" 
              name="receipt_date" 
              value={formData.receipt_date} 
              onChange={handleFormChange} 
              maxLength={50}
            />
          </div>

          {/* 비고 */}
          <div>
            <Form.Label className=" mb-0 fw-bold">비고</Form.Label>
            <Form.Control
              type="text"
              name="comment"
              value={formData.comment}
              onChange={handleFormChange}
              placeholder=""
              maxLength={200}
            />
          </div>
        </Card.Body>
      </Card>

      {/* 기본 정보 카드2 */}
      <Card className="mt-3 shadow-sm">
        {/* <Card.Header className="bg-primary text-white">
          <h6 className="mb-0">
            <i className="bi bi-clipboard-data me-2"></i>
            입고 정보
          </h6>
        </Card.Header> */}

        <Card.Body>
          
          {/* Barcode Scanner */}
          <div className="d-flex gap-2">
              
            <Form.Control 
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              name="barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyUp={handleKeyPress}
              size="md" 
              className="w-100"
              placeholder="자재 바코드를 스캔하세요"
              maxLength={21}
            />
      
            <Button variant="primary" onClick={getData}>
              <i className="bi bi-search"></i>
            </Button>
          </div>

        </Card.Body>
      </Card>


      {/* 품목 목록 카드 */}
      <Card className="mt-3 shadow-sm">
        <Card.Header className="">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              품목 목록 ({items.length}개)
            </h6>
            <div className="d-flex gap-2">
              <Button size="sm" variant="danger" onClick={deleteSelectedItems}>
                {/* <i className="bi bi-trash me-1"></i> */}
                삭제 ({selectedItems.length})
              </Button>
              
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {items.length === 0 ? (
            <div className="text-center py-5 text-muted">
              {/* <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i> */}
              <p className="mt-3 mb-3">등록된 품목이 없습니다.</p>
              
            </div>
          ) : (
            <>
              {/* 전체 선택 */}
              <div className="p-2 border-bottom bg-light">
                <Form.Check
                  type="checkbox"
                  id="select_all"
                  checked={selectedItems.length === items.length && items.length > 0}
                  onChange={toggleAllSelection}
                  className="ms-2 fw-bold fs-6 form-check d-flex gap-2 align-items-center"
                  label={`전체 선택 (${selectedItems.length}/${items.length})`}
                />
              </div>

              {/* 품목 리스트 */}
              <ListGroup variant="flush" className="p-2 d-flex flex-column gap-2">
                {items.map((item, index) => (
                  <ListGroup.Item key={index} className="p-2 border-2 rounded-3">
                    <div className="mb-3">
                      <div className="d-flex align-items-center">
                        <Form.Check
                          type="checkbox"
                          checked={selectedItems.includes(index)}
                          onChange={() => toggleItemSelection(index)}
                          className="me-3"
                          style={{ transform: "scale(1.5)" }} // 1.5배 확대
                        />
                        <h6 className="mb-1">{item.raw_name}</h6>
                      </div>
                      <div>
                        <small className="text-muted">품번: {item.raw_code}</small>
                      </div>
                      <div>
                        <small className="text-muted">기준단위: {item.base_unit}</small>
                      </div>
                      <div>
                        <small className="text-muted">구매단위: {item.unit_size}</small>
                      </div>
                        {/* <h6 className="mb-1">기준단위: {item.base_unit}</h6>
                        <h6 className="">구매단위: {item.unit_size}</h6> */}
                      {/* <Badge bg="secondary">{item.base_unit}</Badge> */}
                    </div>
                    <div className="d-flex justify-content-between align-items-start">
                    </div>

                    <Row className="g-2">
                      <Col xs={3}>
                        <Form.Label className="small fw-bold">발주수량</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity2}
                          onChange={(e) => handleItemChange(index, "quantity2", e.target.value)}
                          placeholder=""
                          size="sm"
                          maxLength={50}
                          disabled
                        />
                      </Col>
                      <Col xs={3}>
                        <Form.Label className="small fw-bold">입고수량</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          placeholder=""
                          size="sm"
                          maxLength={50}
                        />
                      </Col>
                      <Col xs={3}>
                        <Form.Label className="small fw-bold">단가</Form.Label>
                        <Form.Control
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, "unit_price", e.target.value)}
                          placeholder="단가"
                          size="sm"
                          maxLength={50}
                        />
                      </Col>
                      <Col xs={3}>
                        <Form.Label className="small fw-bold">합계</Form.Label>
                        <Form.Control
                          type="text"
                          value={formatMoney(item.total_price)}
                          onChange={(e) => handleItemChange(index, "total_price", e.target.value)}
                          placeholder=""
                          size="sm"
                          maxLength={50}
                          disabled
                        />
                        {/* <strong className="text-primary">{formatMoney(item.total_price)}원</strong> */}
                      </Col>
                    </Row>

                    
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </>
          )}
        </Card.Body>
      </Card>

      {/* 총 합계 카드 */}
      {items.length > 0 && (
        <Card className="mt-3">
          {/* <Card.Body className="bg-light"> */}
            <div className="p-2 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">총 합계</h5>
              <h4 className="mb-0 text-primary">{formatMoney(totalAmount)}원</h4>
            </div>
          {/* </Card.Body> */}
        </Card>
      )}

      {/* 하단 고정 버튼 */}
      <div className="bg-white border-top p-3" style={{ zIndex: 1030 }}>
        <Row className="g-2">
          <Col xs={6}>
            <Button variant="outline-secondary" size="lg" className="w-100" onClick={resetForm}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              초기화
            </Button>
          </Col>
          <Col xs={6}>
            <Button variant="primary" size="lg" className="w-100" onClick={handleSave} disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="me-1" />
                  저장중...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-1"></i>
                  저장
                </>
              )}
            </Button>
          </Col>
        </Row>
      </div>

      {/* 모달들 */}

      {/* 거래처 조회 모달 */}
      <Modal show={showClientModal} onHide={() => setShowClientModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>거래처 조회</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <p>거래처 검색 기능</p>
            <p className="text-muted">실제 구현에서는 거래처 목록이 표시됩니다.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClientModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleClientSelect}>
            선택
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 품목 조회 모달 */}
      <Modal show={showItemModal} onHide={() => setShowItemModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>품목 조회</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <p>품목 검색 기능</p>
            <p className="text-muted">실제 구현에서는 품목 목록이 표시됩니다.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowItemModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleItemAdd}>
            추가
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 발주 조회 모달 */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>발주 조회</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center py-4">
            <p>발주 검색 기능</p>
            <p className="text-muted">실제 구현에서는 발주 목록이 표시됩니다.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            취소
          </Button>
          <Button variant="primary" onClick={handleOrderSelect}>
            선택
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default Main

