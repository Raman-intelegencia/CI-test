import React, { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import './ComposeBox.scss';

const ComposeBox = (props) => {
  const [value, setValue] = useState(props.value || '');

  const handleChange = (e) => {
    const text = e.target.value;
    setValue(text);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    props.onSubmit({
      text: value,
    });
    clear();
  };

  const clear = () => {
    setValue('');
  };

  const enabled = value.length && !props.loading;

  return (
    <form className={`composebox ${props.className}`} onSubmit={handleSubmit}>
      <TextareaAutosize
        rows={1}
        maxRows={3}
        className="composebox__field"
        name="writehere"
        placeholder="Write a message"
        aria-label="Write a message"
        onChange={handleChange}
        value={value}
      />
      <div className="composebox__actions">
        <input
          className="composebox__button"
          type="submit"
          value="Send"
          disabled={!enabled}
        />
      </div>
    </form>
  );
};

export default ComposeBox;
