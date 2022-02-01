import { useRef, useEffect, useState } from "react";
import { Tag, Input, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { createUseStyles } from "react-jss";

const useStyles = createUseStyles({
    siteTagPlus: {
        background: "#fff",
        borderStyle: "dashed",
    },
    editTag: {
        userSelect: "none",
    },
    tagInput: {
        width: 78,
        marginRight: 8,
        verticalAlign: "top",
    },
});

const AddableTags = ({ initialTags, addButtonText, style, className, onChange }) => {
    const classes = useStyles();
    const input = useRef();
    const editInput = useRef();

    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState(-1);

    useEffect(() => {
        if (initialTags) {
            setTags(initialTags);
        }
    }, [initialTags]);

    const handleClose = (removedTag) => {
        let newTags = tags.filter((tag) => tag !== removedTag);
        setTags(newTags);
        if (onChange) onChange(newTags);
    };

    const showInput = () => {
        setInputVisible(true);
        setTimeout(() => input.current.focus(), 100);
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleInputConfirm = () => {
        let newTags = tags;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            newTags = [...tags, inputValue];
        }
        setTags(newTags);
        if (onChange) onChange(newTags);
        setInputVisible(false);
        setInputValue("");
    };

    const handleEditInputChange = (e) => {
        setEditInputValue(e.target.value);
    };

    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;

        setTags(newTags);
        if (onChange) onChange(newTags);
        setEditInputIndex(-1);
        setEditInputValue("");
    };

    //TODO posibility to render a dropdown

    //TODO calculate color by tag text
    return (
        <div className={className} style={style}>
            {tags.map((tag, index) => {
                if (editInputIndex === index) {
                    return (
                        <Input
                            ref={editInput}
                            key={tag}
                            size="small"
                            className={classes.tagInput}
                            value={editInputValue}
                            onChange={handleEditInputChange}
                            onBlur={handleEditInputConfirm}
                            onPressEnter={handleEditInputConfirm}
                        />
                    );
                }

                const isLongTag = tag.length > 20;

                const tagElem = (
                    <Tag className={classes.editTag} key={tag} closable onClose={() => handleClose(tag)}>
                        <span
                            onDoubleClick={(e) => {
                                setEditInputValue(tag);
                                setEditInputIndex(index);
                                setTimeout(() => editInput.current.focus(), 100);
                                e.preventDefault();
                            }}>
                            {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                        </span>
                    </Tag>
                );
                return isLongTag ? (
                    <Tooltip title={tag} key={tag}>
                        {tagElem}
                    </Tooltip>
                ) : (
                    tagElem
                );
            })}
            {inputVisible && (
                <Input
                    ref={input}
                    type="text"
                    size="small"
                    className={classes.tagInput}
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputConfirm}
                    onPressEnter={handleInputConfirm}
                />
            )}
            {!inputVisible && (
                <Tag className={classes.siteTagPlus} onClick={showInput}>
                    <PlusOutlined /> {addButtonText || "New Tag"}
                </Tag>
            )}
        </div>
    );
};

export default AddableTags;
