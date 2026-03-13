// ** MUI Imports
import Slider from "@mui/material/Slider";

const valuetext = (value: number) => {
  return `${value}°C`;
};

const SliderSmallSteps = () => {
  return (
    <Slider
      marks
      step={5}
      defaultValue={20}
      valueLabelDisplay='auto'
      getAriaValueText={valuetext}
      aria-labelledby='small-steps-slider'
    />
  );
};

export default SliderSmallSteps;
