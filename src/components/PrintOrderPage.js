import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "utils/Axios";


const Main = ({ order, items }) => {
  // const mst = useRef(props.current);
  // const [order, setOrder] = useState(null);
  // const [items, setItems] = useState([]);
  const [priceSum, setPriceSum] = useState(0);

  const tableRef = useRef(null);
  const [tableHeight, setTableHeight] = useState(0);

  // 숫자를 한글 금액으로 변환
  function num2han(num) {
    num = parseInt((num + "").replace(/[^0-9]/g, ""), 10) + "";
    if (num === "0") return "영";
    const number = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"];
    const unit = ["", "만", "억", "조"];
    const smallUnit = ["천", "백", "십", ""];
    const result = [];
    let unitCnt = Math.ceil(num.length / 4);
    num = num.padStart(unitCnt * 4, "0");
    const array = num.match(/[\w\W]{4}/g);
    for (let i = array.length - 1, unitCnt = 0; i >= 0; i--, unitCnt++) {
      const hanValue = makeHan(array[i]);
      if (hanValue === "") continue;
      result.unshift(hanValue + unit[unitCnt]);
    }
    function makeHan(text) {
      let str = "";
      for (let i = 0; i < text.length; i++) {
        let n = text[i];
        if (n === "0") continue;
        str += number[n] + smallUnit[i];
      }
      return str;
    }
    return result.join("");
  }


  useEffect(() => {
    const total = (items || []).reduce((sum, i) => sum + i.total_price, 0);
    setPriceSum(total);
  }, [items]);

  if (!order) return <div className="p-4">로딩중...</div>;

  return (
    <div className="wrap p-4">
      <h1 className="title py-2 fw-bolder" style={{ letterSpacing:'10px', fontSize: '34px', textAlign:'center'}}>발주서</h1>

      {/* 발주서 헤더 */}
      <table className="table table-bordered border-dark">
        <tbody>
          <tr>
            <td colSpan="2" className="text-center">
              <strong>{order.client_name}</strong> 귀하
            </td>
            <td rowSpan="9" style={{ width: "20px", textAlign: "center" }}>
              공급받는자
            </td>
            <td colSpan="4" rowSpan="2" className="text-center">
              <img src="/assets/images/logo-icon.png" alt="logo" height="50" />
            </td>
          </tr>
          <tr>
            <th className="">발주일자</th>
            <td className="">{order.order_date}</td>
          </tr>
          <tr>
            <th className="py-1">수신</th>
            <td className="py-1">{order.manager}</td>
            <th className="py-1">상호</th>
            <td className="py-1">(주)동일프라텍</td>
            <th className="py-1">대표자</th>
            <td className="py-1">김지현</td>
          </tr>
          <tr>
            <th className="py-1">전화</th>
            <td className="py-1">{order.phone}</td>
            <th className="py-1">사업자번호</th>
            <td className="py-1">141-81-26595</td>
            <th className="py-1">FAX</th>
            <td className="py-1">031-941-9943</td>
          </tr>
          <tr>
            <th className="py-1">FAX</th>
            <td className="py-1">{order.fax}</td>
            <th className="py-1">담당자</th>
            <td className="py-1">{order.login_name}</td>
            <th className="py-1">전화</th>
            <td className="py-1">031-941-1540</td>
          </tr>
          <tr>
            <th className="py-1">발주번호</th>
            <td className="py-1">{order.purchase_id}</td>
            <th className="py-1">이메일</th>
            <td className="py-1" colSpan="3">info@diang.co.kr</td>
          </tr>
          <tr>
            <th className="py-1">유효기간</th>
            <td className="py-1"></td>
            <th className="py-1" rowSpan="2">주소</th>
            <td className="py-1" colSpan="3" rowSpan="2">
              경기도 파주시 적성면 적성단2로 16-5
            </td>
          </tr>
          <tr>
            <th className="py-1">납기일자</th>
            <td className="py-1">{items?.[0]?.due_date}</td>
          </tr>
          <tr>
            <th className="py-1">결제조건</th>
            <td className="py-1"></td>
            <th className="py-1">업태</th>
            <td className="py-1">제조, 도매</td>
            <th className="py-1">종목</th>
            <td className="py-1">플라스틱제품</td>
          </tr>
        </tbody>
      </table>

      {/* 안내 문구 */}
      <p className="mt-2">아래와 같이 발주합니다.</p>

      {/* 합계금액 */}
      <table className="table table-bordered border-dark">
        <tbody>
          <tr>
            <td>
              합계금액 : 일금{" "}
              <strong>{num2han(priceSum)}</strong> 원정 (￦
              {priceSum.toLocaleString()})
            </td>
          </tr>
        </tbody>
      </table>

      {/* 품목 리스트 */}
      <table className="table table-bordered border-dark" ref={tableRef}>
        <thead>
          <tr>
            <th className="py-1 text-center" style={{minWidth:'2rem'}}>No.</th>
            <th className="py-1 text-center" style={{width:'20rem'}}>품목</th>
            <th className="py-1 text-center" style={{minWidth:'6rem'}}>납기일자</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>규격</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>수량</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>단가</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>합계</th>
            <th className="py-1 text-center" style={{minWidth:'3rem'}}>비고</th>
          </tr>
        </thead>
        <tbody>
          {items && items.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 text-center">{idx + 1}</td>
              <td className="py-1 ">{item.raw_name}</td>
              <td className="py-1 text-center">{item.due_date}</td>
              <td className="py-1 text-center">{item.unit_size}</td>
              <td className="py-1 text-end">{item.quantity?.toLocaleString()}</td>
              <td className="py-1 text-end">{item.unit_price?.toLocaleString()}</td>
              <td className="py-1 text-end">{item.total_price?.toLocaleString()}</td>
              <td>{item.remarks}</td>
            </tr>
          ))}

          {items && [...Array((Array.isArray(items) ? items.length : 0) < 10 ? 10 - (Array.isArray(items) ? items.length : 0) : 0)].map((_, idx) => (
            <tr key={items.length + idx}>
              <td className="py-1 text-center">{items.length + idx + 1}</td>
              <td className="py-1"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1 text-end"></td>
              <td className="py-1"></td>
            </tr>
          ))}

        </tbody>
        <tfoot>
          <tr>
            <td className="py-1 text-center">계</td>
            <td className="py-1 " colSpan="5"></td>
            <td className="py-1 text-end">{priceSum.toLocaleString()}</td>
            <td className="py-1 "></td>
          </tr>
        </tfoot>
      </table>

      {/* 특이사항 */}
      <table className="table table-bordered border-dark mt-3" style={{height:'100%'}}>
        <thead>
          <tr>
            <th>특이사항</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="text-start h-100">
              <div style={{minHeight:80, height:'100%'}}>
                <span>
                  {order.comment}
                </span>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}


export default Main;