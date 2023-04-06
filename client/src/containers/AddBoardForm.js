import { Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { addBoardAction, fetchBoardsAction } from "../features/boardsSlice";
import { setModalClosed } from "../features/modalOpenSlice";

const AddBoardForm = () => {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();

  const handleFormSubmit = async (data) => {
    await dispatch(addBoardAction(data));
    await dispatch(fetchBoardsAction());
    dispatch(setModalClosed());
  }

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}> 
      <Form.Group className="mb-3" controlId="formBasicTitle">
        <Form.Control type="text" placeholder="Enter Board Title" {...register("title")} />
      </Form.Group>
      <Button variant="primary" type="submit">Submit</Button>
    </Form>
  )
}

export default AddBoardForm;