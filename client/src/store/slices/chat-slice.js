export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) => set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) => set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) => set({ directMessagesContacts }),
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  closeChat: () =>
    set({ selectedChatType: undefined, selectedChatData: undefined, selectedChatMessages: [] }),
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient: selectedChatType === "channel" ? message.recipient : message.recipient._id,
          sender: selectedChatType === "channel" ? message.sender : message.sender._id,
        },
      ],
    });
  },
  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const index = channels.findIndex((channel) => channel._id === message.channelId);

    if (index !== -1) {
      // Remove the channel from its current position
      const [channel] = channels.splice(index, 1);
      // Add it to the front of the list
      set({ channels: [channel, ...channels] });
    }
  },
  addContactsInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const formId = message.sender._id === userId ? message.recipient._id : message.sender._id;
    const formData = message.sender._id === userId ? message.recipient : message.sender;
    const directMessagesContacts = get().directMessagesContacts;
    const data = directMessagesContacts.find((contact) => contact._id === formId);
    const index = directMessagesContacts.findIndex((contact) => contact._id === formId);
    if (index !== -1) {
      directMessagesContacts.splice(index, 1);
      directMessagesContacts.unshift(data);
    } else {
      directMessagesContacts.unshift(formData);
    }
    set({ directMessagesContacts });
  },
});
