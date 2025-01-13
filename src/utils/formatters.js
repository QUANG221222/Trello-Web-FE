export const capitalizeFirstLetter = (val) => {
  if (!val) return ''
  return `${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

/*
  Video 37.2: cách xử lý bug logic thư viện dnd-kit khi column là rỗng:
  Phía FE sẽ tự tạo ra 1 cái card đặt biệt: Placeholder card, không liên quan đến BE
  Cấu trúc Id của cái card này để Unique rất đơn giản, không cần phải làm random phức tạp:
  'columnId-placeholder-card' (mỗi column chỉ có thể tối đa 1 cái placeholderCard)
  Quan trọng khi tạo: phải đầy đủ : {_id, boardId, columnId, FE_PlaceholderCard}
*/
export const generatePlaceholderCard = (column) => {
  return {
    _id: `${column._id}-placeholder-card`,
    boardId: column.boardId,
    columnId: column._id,
    FE_PlaceholderCard: true
  }
}
