
const Message = ({ error, success }) => {
  return (
    <>
      {error && <p className="message error">{error}</p>}
      {success && <p className="message success">{success}</p>}
    </>
  );
};

export default Message;
