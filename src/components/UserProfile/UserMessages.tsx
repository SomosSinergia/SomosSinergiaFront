import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getMessages, updateMessageStatus } from "@/helpers/messageHelpers";
import { MessageData } from "@/types/MessageData";
import DataTable, { TableColumn } from "react-data-table-component";
import DateComponent from "../Date/Date";
import MessageModal from "../Modals/MessageModal";
import { readMessageAction } from "@/redux/features/userSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import ExpirationModal from "../Modals/ExpirationModal";
import { TokenExpiredError } from "@/helpers/userHelpers";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";

function UserMessages() {
  const [showModal, setShowModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(
    null
  );
  const [expirationModal, setExpirationModal] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.userActive);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messages = await getMessages();
        if (messages) {
          const sortedMessages = messages.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setMessages(sortedMessages);
        }
      } catch (error) {
        if (error instanceof TokenExpiredError) {
          setExpirationModal(true);
        } else {
          toast.error("Error al obtener datos del usuario.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleReadClick = async (message: MessageData) => {
    if (message.status === "UNREAD" && user?.role === "USER") {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === message.id ? { ...msg, status: "READ" } : msg
        )
      );
      try {
        await updateMessageStatus(message.id);
        dispatch(readMessageAction(message.id));
      } catch (error) {
        setError("Error updating message status");
      }
    }

    setSelectedMessage(message);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  const columns: TableColumn<MessageData>[] = [
    {
      name: "",
      cell: (row) => (
        <button
          onClick={() => handleReadClick(row)}
          className="md:w-24 lg:w-28 xl:w-32 w-full px-2 py-2 bg-[#46C2CA] text-white rounded-lg hover:bg-blue-700"
        >
          {user?.role === "ADMIN" ? "Ver" : "Leer"}
        </button>
      ),
      ignoreRowClick: true,
      width: "70px",
    },
    {
      name: "Título",
      selector: (row) => row.title,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => row.createdAt,
      cell: (row) => <DateComponent dateString={row.createdAt} />,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => row.status,
      sortable: true,
      cell: (row) => {
        if (user?.role === "ADMIN") {
          if (row.sender.id === user.id) {
            return (
              <div className="px-4 py-2 rounded-lg bg-green-300 font-bold text-green-700">
                enviado
              </div>
            );
          } else {
            return (
              <div className="px-4 py-2 rounded-lg bg-yellow-300 font-bold text-yellow-700">
                recibido
              </div>
            );
          }
        } else {
          return row.status === "READ" ? (
            <div className="px-4 py-2 rounded-lg bg-green-300 font-bold text-green-700">
              visto
            </div>
          ) : (
            <div className="px-4 py-2 rounded-lg bg-red-300 font-bold text-red-700">
              no visto
            </div>
          );
        }
      },
    },
  ];

  if (user?.role === "USER") {
    columns.splice(2, 0, {
      name: "Enviado por",
      selector: (row) => row.sender.firstName,
      sortable: true,
    });
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-h-[22rem] shadow-md rounded-lg">
      {messages.length === 0 ? (
        <div className="py-20 flex items-center justify-center p-5 bg-white border">
          <Image
            src="/images/Sinergia-NoMessages.png"
            alt={""}
            width={160}
            height={160}
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={messages}
          pagination
          fixedHeader
          className="h-[18rem]"
        />
      )}
      {showModal && (
        <MessageModal
          onRequestClose={handleCloseModal}
          selectedMessage={selectedMessage}
        />
      )}
      {expirationModal && (
        <ExpirationModal setExpirationModal={setExpirationModal} />
      )}
    </div>
  );
}

export default UserMessages;
