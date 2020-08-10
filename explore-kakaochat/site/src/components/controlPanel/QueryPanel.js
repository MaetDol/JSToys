import React from 'react';
import styled from 'styled-components';

import Input from '../Input.js';
import Checkbox from '../Checkbox.js';

const Form = styled.form`
`;

const SearchButton = styled.button`
  background: var(--text-light-medium);
  padding: 4px 24px;
  cursor: pointer;
  &:active {
    background: var(--color-point);
  }
`;

const Row = styled.div`
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function QueryPanel() {

  const inputDatas = [
    {
      id: 'chat',
      label: '대화 내용',
      placeholder: '여기 참고하시면 돼요!',
      checkbox: '정규표현식'
    },
    {
      id: 'user',
      label: '얘기한 사람',
      placeholder: '귀여운 어피치',
    },
    {
      id: 'date',
      label: '얘기했던 날짜',
      placeholder: '2019년 12월 8일',
      checkbox: '범위 지정'
    }
  ];

  const search = e => {
    e.preventDefault();
  };

  return (
    <Form onSubmit={search}>
      <Row>
        <span>대화검색</span>
        <SearchButton>검색</SearchButton>
      </Row>
      { inputDatas.map( data => (
        <Input
          key={data.id}
          id={data.id}
          label={data.label}
          placeholder={data.placeholder}
        >
          {data.checkbox &&
            <Checkbox label={data.checkbox} style={{ float:'right' }}/>
          }
        </Input>
      ))} 
    </Form>
  );
}

export default QueryPanel;
