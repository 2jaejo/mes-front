import React, { useState, useEffect } from "react";

const Forms = ({ id, fields, onSearchData, direction="horizontal" }) => {

  const initialData = (data) => {
    let result = data.reduce((acc, field) => {
      if ("default" in field){
        acc[`${field.name}`] = field.default;
      }
      else{
        if (field.type === "checkbox"){
          acc[`${field.name}`] = []; 
        }
        else{
          acc[`${field.name}`] = ""; 
        }
      }
      return acc;
    }, {});

    return result;
  };

  // 입력 필드 상태 관리 (JSON 형태)
  const [inputsState, setInputsState] = useState(initialData(fields));
  
  // inputsState가 변경될 때마다 호출되는 함수
  useEffect(() => {
    const runSomeFunction = () => {
      onSearchData(inputsState);
    };

    runSomeFunction();
  }, [onSearchData, inputsState]); // inputsState가 변경될 때마다 실행됨


  // 입력 값 변경 핸들러
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const filteredName = name.replace(`${id}_`,"");

    if (event.target.type === "checkbox") {
      setInputsState((prev) => {
        const prevValue = prev[filteredName];
        const nextValue = prevValue.includes(value)
          ? prevValue.filter((v) => v !== value)
          : [...prevValue, value];
        return {
          ...prev,
          [filteredName]: nextValue,
        };
      });

    }
    else {
      setInputsState((prev) => ({
        ...prev,
        [filteredName]: value,
      }));

    }
  };



  // 입력 필드 생성
  const createInput = (field) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type={field.type}
            className={field.className}
            name={`${id}_${field.name}`}
            value={inputsState[field.name]}
            onChange={handleInputChange}
            style={styles.input}
            maxLength="50"
          />
        );
      case "number":
        return (
          <input
            type="text"
            className={field.className}
            name={`${id}_${field.name}`}
            inputMode="numeric" 
            pattern="[0-9]*"
            value={inputsState[field.name]}
            onChange={(e) => {
              // 숫자 제외한 문자 제거
              const filteredValue = e.target.value = e.target.value.replaceAll(/\D/g, "");
              setInputsState((prev) => ({
                ...prev,
                [field.name]: filteredValue,
              }));
            }}
            onKeyUp={(e)=>{
              if (!/^\d$/.test(e.key) && e.key !== "Backspace") {
                e.preventDefault(); // 숫자와 백스페이스 외 입력 방지
              }
            }}
            onPaste={(e) => {
              const pasteData = e.clipboardData.getData("text");
              if (!/^\d+$/.test(pasteData)) {
                e.preventDefault(); // 붙여넣기로 문자가 입력되지 않도록 방지
              }
            }} 
            style={styles.input}
            maxLength="50"
          />
        );
      case "select":
        return (
          <select
              name={field.name}
              className={field.className}
              value={inputsState[`${field.name}`]}
              onChange={handleInputChange}
              style={styles.select}
            >
              {field.options.map((option, idx) => (
                <option key={idx} value={option.value}>
                  {option.key}
                </option>
              ))}
            </select>
        );
      case "radio":
        return (
          <div style={styles.radioGroup}>
            {field.options.map((option, idx) => (
              <div key={idx} style={styles.radioItem}>
                <input
                  type="radio"
                  className={field.className}
                  id={`${id}_${field.type}-${field.name}-${idx}`} // id로 고유값 설정
                  name={`${id}_${field.name}`} // name 속성은 같은 그룹으로 묶이게
                  value={option.value} // 각 옵션의 value 설정
                  checked={inputsState[`${field.name}`] === option.value} // 선택된 값 확인
                  onChange={handleInputChange} // 값 변경 시 상태 업데이트
                />
                <label style={styles.subLabel} htmlFor={`${id}_${field.type}-${field.name}-${idx}`}>{option.key}</label>
              </div>
            ))}
          </div>
        );
      case "checkbox":
        return (
          <div style={styles.checkboxGroup}>
            {field.options.map((option, idx) => (
              <div key={idx} style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  className={field.className}
                  id={`${id}-${field.type}-${field.name}-${idx}`} // id로 고유값 설정
                  name={`${id}_${field.name}`} // name 속성은 여러 체크박스를 하나의 그룹으로 묶음
                  value={option.value} // 각 옵션의 value 설정
                  checked={inputsState[`${field.name}`].includes(option.value)} // 선택된 체크박스 확인
                  onChange={handleInputChange} // 값 변경 시 상태 업데이트
                />
                <label style={styles.subLabel} htmlFor={`${id}-${field.type}-${field.name}-${idx}`}>{option.key}</label>
              </div>
            ))}
          </div>
        );
      case "date":
        return (
          <input
            type={field.type}
            className={field.className}
            name={field.name}
            value={inputsState[`${field.name}`]}
            onChange={handleInputChange}
            style={styles.input}
            maxLength="50"
          />
        );
      default:
        return null;
    }
  }

  // 스타일 객체
  const styles = {
    searchBar: {
      display: "flex",
      justifyContent: "start", 
      alignItems: "center",
      gap: "10px", 
      flexWrap: "wrap", 
    },
    inputContainer: {
      display: "flex",
      flex: 1,
      flexDirection: direction === "horizontal" ? "row" : "column" ,
      alignItems: direction === "horizontal" ? "center" : "start",
      flexWrap: "wrap", 
      gap: '10px',
    },
    inputSubContainer: {
      display: "flex",
      alignItems: "center",
    },
    label: {
      whiteSpace: "nowrap", /* 줄 바꿈을 방지 */
      marginRight: "5px",
      fontWeight: "bold",
    },
    subLabel: {
      whiteSpace: "nowrap", /* 줄 바꿈을 방지 */
      marginRight: "2px",
    },
    input: {
      
    },
    select: {
      
    },
    radioGroup: {
      display: 'flex',           
      justifyContent: 'flex-start',
      gap: '4px',             
    },
    radioItem: {
      display: 'flex',
      alignItems: 'center',
    },
    checkboxGroup: {
      display: 'flex',                
      flexDirection: 'row',           
      gap: '4px',                   
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',           
    },

  };


  return (
    <div style={styles.searchBar}>
      {/* 동적으로 input 생성 */}
      <div style={styles.inputContainer}>
        {fields.map((field, index) => (
          <div key={index} style={styles.inputSubContainer}>
            <label style={styles.label}>{field.label}: </label>
            {createInput(field)}
          </div>
        ))}
      </div>

    </div>
  );
};



export default Forms;
