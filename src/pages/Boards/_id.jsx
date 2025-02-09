import { useState, useEffect } from 'react'
import { Container } from '@mui/material'
import AppBar from '~/components/AppBar/AppBar'
import BoardBar from './BoardBar/BoardBar'
import BoxContent from './BoardContent/BoardContent'
// import { mockData } from '~/apis/mock-data'
import { fetchBoardDetailsAPI } from '~/apis'

function Board() {
  const [board, setBoard] = useState(null)
  useEffect(() => {
    // Tạm thời fix cứng boardId, flow chuẩn chỉnh về sau khi học nâng cao trực tiếp, chúng ta sẽ sử dụng react-router-dom để lấy boardId từ URL
    const boardId = '67a86a4bd6388a26c2404a8b'
    //Call API
    fetchBoardDetailsAPI(boardId).then((board) => {
      setBoard(board)
    })
  }, [])
  return (
    <Container disableGutters maxWidth="false" sx={{ height: '100vh' }}>
      <AppBar />
      <BoardBar board={board} />
      <BoxContent board={board} />
    </Container>
  )
}

export default Board
