import React from "react";
import TextInput from "./TextInput";
import TextArea from "./TextArea";
import Checkbox from "./Checkbox";
import Radio from "./Radio";
import DropdownList from 'react-widgets/lib/DropdownList'
import 'react-widgets/dist/css/react-widgets.css'

const renderField = props => (
  <div>
    {(props.type === "email" ||
      props.type === "password" ||
      props.type === "text" ||
      props.type === "number") && <TextInput {...props} />}
    {props.type === "checkbox" && <Checkbox {...props} />}
    {props.type === "radio" && <Radio {...props} />}
    {props.type === "textarea" && <TextArea {...props} />}
    {props.type === "dropdown" && <DropdownList {...props} />}

  </div>
);

export default renderField;
