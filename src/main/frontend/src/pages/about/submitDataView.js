
import React, { useState, useEffect } from 'react';
import yaml from 'js-yaml';
import axios from 'axios';
import YAMLData from '../../content/prod/aboutPagesContent.yaml';
import stockImg from '../../assets/about/Photo-About_SubmittingData.jpg';
import AboutBody from '../../components/About/AbouBodyView';

const ABOUT_CONTENT_URL = process.env.REACT_APP_ABOUT_CONTENT_URL;


const RequestAccessView = () => {
  const [data, setData] = useState([]);

  useEffect(async () => {
    let resultData = [];
    try {
      const result = await axios.get(ABOUT_CONTENT_URL);
      resultData = yaml.safeLoad(result.data);
    } catch (error) {
      const result = await axios(YAMLData);
      resultData = yaml.safeLoad(result.data);
    }
    const supportObj = resultData.find(({ page }) => page === '/submit-data');
    setData(supportObj);
  }, []);

  return (
    <>
      <AboutBody data={{
        img: stockImg,
        title: data.title,
        content: data.content,
        table: data.table,
      }}
      />
    </>
  );
};
export default RequestAccessView;
