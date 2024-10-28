import { Cards } from "nextra/components";

const CardBox = ({ data }) => {
  return (
    <Cards>
      {Object.entries(data).map(([key, value]) => (
        <Cards.Card title={`${key}${value}`} href="#" />
      ))}
    </Cards>
  );
};

export default CardBox;
