import React from 'react';
class PathIdForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pathId: null,
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({
      pathId: event.target.value,
    });
  }

  handleSubmit(event) {
    this.props.onClick(this.state);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>Διάλεξε ένα pathId για να εμφανιστεί στο χάρτη</label>
        <input
          type="text"
          name="pathId"
          placeholder=""
          min="1"
          max="228"
          onChange={this.handleChange}
        />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}
export default PathIdForm;
