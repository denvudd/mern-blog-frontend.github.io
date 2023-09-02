import React from "react";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import SimpleMDE from "react-simplemde-editor";

import "easymde/dist/easymde.min.css";
import styles from "./AddPost.module.scss";
import { useSelector } from "react-redux";
import { isAuthSelector } from "../../redux/slices/auth";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "../../axios";

export const AddPost = () => {
  const isAuth = useSelector(isAuthSelector);
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditing = Boolean(id);

  React.useEffect(() => {
    // edit
    if (id) {
      axios.get(`/posts/${id}`).then((res) => {
        setFormState((prevState) => ({
          text: res.data.text,
          title: res.data.title,
          tags: res.data.tags.join(" "),
          imageUrl: res.data.imageUrl,
        }));
      });
    }
  }, []);

  const [formState, setFormState] = React.useState({
    text: "",
    title: "",
    tags: "",
    imageUrl: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const inputFileRef = React.useRef(null);

  const onChange = React.useCallback((text) => {
    setFormState((prevState) => ({
      ...prevState,
      text,
    }));
  }, []);

  const handleChangeFile = async (event) => {
    try {
      const formData = new FormData();
      const file = event.target.files[0];

      formData.append("image", file);

      const { data } = await axios.post("/upload", formData);

      setFormState((prevState) => ({
        ...prevState,
        imageUrl: data.url,
      }));
    } catch (error) {
      console.warn(error);
      alert("Ошибка при загрузке файла!");
    }
  };

  const onClickRemoveImage = async () => {
    setFormState((prevState) => ({
      ...prevState,
      imageUrl: "",
    }));
  };

  const onSubmit = async () => {
    try {
      setIsLoading(true);

      const payload = {
        title: formState.title,
        text: formState.text,
        tags: formState.tags,
        imageUrl: formState.imageUrl,
      };

      const { data } = isEditing
        ? await axios.patch(`/posts/${id}`, payload)
        : await axios.post("/posts", payload);

      const _id = isEditing ? id : data._id;

      navigate(`/posts/${_id}`);
    } catch (error) {
      console.warn(error);
      alert("Ошибка при создании поста!");
    }
  };

  const options = React.useMemo(
    () => ({
      spellChecker: false,
      maxHeight: "400px",
      autofocus: true,
      placeholder: "Введите текст...",
      status: false,
      autosave: {
        enabled: true,
        delay: 1000,
      },
    }),
    []
  );

  if (!window.localStorage.getItem("token") && !isAuth) {
    return <Navigate to="/" />;
  }

  return (
    <Paper style={{ padding: 30 }}>
      <form>
        <Button
          onClick={() => inputFileRef.current.click()}
          variant="outlined"
          size="large"
          type="button"
        >
          Загрузить превью
        </Button>
        <input
          type="file"
          ref={inputFileRef}
          hidden
          onChange={handleChangeFile}
        />
        <br />
        <br />
        {formState.imageUrl && (
          <>
            <Button
              variant="contained"
              color="error"
              onClick={onClickRemoveImage}
              type="button"
            >
              Удалить
            </Button>
            <img
              ref={inputFileRef}
              className={styles.image}
              src={`http://localhost:4444${formState.imageUrl}`}
              alt="Uploaded"
            />
          </>
        )}
        <br />
        <br />
        <TextField
          classes={{ root: styles.title }}
          variant="standard"
          placeholder="Заголовок статьи..."
          fullWidth
          value={formState.title}
          onChange={(e) =>
            setFormState((prevState) => ({
              ...prevState,
              title: e.target.value,
            }))
          }
        />
        <TextField
          classes={{ root: styles.tags }}
          variant="standard"
          placeholder="Тэги"
          fullWidth
          value={formState.tags}
          onChange={(e) =>
            setFormState((prevState) => ({
              ...prevState,
              tags: e.target.value,
            }))
          }
        />
        <SimpleMDE
          className={styles.editor}
          value={formState.text}
          onChange={onChange}
          options={options}
        />
        <div className={styles.buttons}>
          <Button
            type="button"
            onClick={onSubmit}
            size="large"
            variant="contained"
          >
            {isEditing ? "Сохранить" : "Опубликовать"}
          </Button>
          <Button type="button" size="large">
            Отмена
          </Button>
        </div>
      </form>
    </Paper>
  );
};
