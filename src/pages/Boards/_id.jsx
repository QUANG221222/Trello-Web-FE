import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoardContent from './BoardContent/BoardContent'

// import { mockData } from '~/apis/mock-data'
import {
  fetchBoardDetailsAPI,
  createNewColumnAPI,
  createNewCardAPI
} from '~/apis'
import { generatePlaceholderCard } from '~/utils/formatters'
import { isEmpty } from 'lodash'

function Board() {
  const [board, setBoard] = useState(null)
  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉnh về sau khi học nâng cao trực tiếp, chúng ta sẽ sử dụng react-router-dom để lấy boardId từ URL
    const boardId = '67a86a4bd6388a26c2404a8b'
    //Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      // Cần xử lý vấn đến kéo thả một column rỗng (placeholder card)
      board.columns.forEach((column) => {
        if (isEmpty(column.cards)) {
          column.cards = [generatePlaceholderCard(column)]
          column.cardOrderIds = [generatePlaceholderCard(column)._id]
        }
      })
      setBoard(board)
    })
  }, [])

  //Func này có nhiệm vụ gọi API tạo mới column và làm lại state board
  const createNewColumn = async (newColumnData) => {
    const createdColumn = await createNewColumnAPI({
      ...newColumnData,
      boardId: board._id
    })

    // Khi tạo column mới thì nó sẽ chưa có carrd, cần xử lý vấn đề kéo thẻ vào một column rỗng (nhớ lại video 37.2, code hiện tại là video 69)
    createdColumn.cards = [generatePlaceholderCard(createdColumn)]
    createdColumn.cardOrderIds = [generatePlaceholderCard(createdColumn)._id]

    // Cập nhật lại State Board
    // Phía Frontend chúng ta phải tự làm đúng lại state board(thay vì phải gọi lại api fecthBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù của dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ board dù đây có là api tạo Column hay Card đi chăng nữa => Lúc này FE nhàn hơn.
    const newBoard = { ...board }
    newBoard.columns.push(createdColumn)
    newBoard.columnOrderIds.push(createdColumn._id)
    setBoard(newBoard)
  }

  //Func này có nhiệm vụ gọi API tạo mới card và làm lại state board
  const createNewCard = async (newCardData) => {
    const createdCard = await createNewCardAPI({
      ...newCardData,
      boardId: board._id
    })
    // console.log('createdCard: ', createdCard)

    // Cập nhật lại State Board
    // Phía Frontend chúng ta phải tự làm đúng lại state board(thay vì phải gọi lại api fecthBoardDetailsAPI)
    // Lưu ý: cách làm này phụ thuộc vào tùy lựa chọn và đặc thù của dự án, có nơi thì BE sẽ hỗ trợ trả về luôn toàn bộ board dù đây có là api tạo Column hay Card đi chăng nữa => Lúc này FE nhàn hơn.
    const newBoard = { ...board }
    const columnToUpdate = newBoard.columns.find(
      (column) => column._id === createdCard.columnId
    )
    if (columnToUpdate) {
      columnToUpdate.cards.push(createdCard)
      columnToUpdate.cardOrderIds.push(createdCard._id)
    }
    setBoard(newBoard)
  }

  return (
    <Container disableGutters maxWidth="false" sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoardContent
        board={board}
        createNewColumn={createNewColumn}
        createNewCard={createNewCard}
      />
    </Container>
  )
}

export default Board
