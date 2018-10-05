import React from 'react';
import { Carousel } from 'react-bootstrap';
import receipt from '../images/slider-receipt.jpg';
import calc from '../images/slider-calc.jpg';
import excel from '../images/slider-excel.jpg';

export const Home = () => {
  return (
    <Carousel>
      <Carousel.Item>
        <img alt="receipt" src={receipt} />
        <Carousel.Caption>
          <h3>Got shared expenses?</h3>
          <p>God I wish I can keep track of all that receipts...</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img alt="calculator" src={calc} />
        <Carousel.Caption>
          <h3>Still doing it old-school and by hand?</h3>
          <p>There should be a 21st centry solution for this!</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img alt="excel" src={excel} />
        <Carousel.Caption>
          <h3>Spreadsheets are fine, until you lose them...</h3>
          <p>There is also the pain of needing to manually click and drag...
            and make sure all the formulae are correct.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
};