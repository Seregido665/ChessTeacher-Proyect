// notation.js

import { makeTempMove, undoTempMove } from './boardUtils';
import { isInCheck, hasLegalMoves } from './checks';
import { getLegalMoves } from './legalMoves';

export function toAlgebraicNotation(board, move, piece, lastMove, castlingRights) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  const from = `${files[move.fromCol]}${8 - move.fromRow}`;
  const to   = `${files[move.toCol]}${8 - move.toRow}`;

  // Enroques
  if (piece.type === 'king' && Math.abs(move.toCol - move.fromCol) === 2) {
    return move.toCol > move.fromCol ? 'O-O' : 'O-O-O';
  }

  const pieceLetter = {
    pawn:   '',
    knight: 'N',
    bishop: 'B',
    rook:   'R',
    queen:  'Q',
    king:   'K'
  }[piece.type];

  // Detección de captura (incluye captura al paso)
  const isCapture = !!board[move.toRow][move.toCol] ||
                    !!move.moveData?.enPassant;

  // Búsqueda de piezas ambiguas (solo las que realmente pueden llegar legalmente)
  const findAmbiguous = (type, color, targetRow, targetCol, excludeRow, excludeCol) => {
    const list = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === type && p.color === color &&
            (r !== excludeRow || c !== excludeCol)) {
          const moves = getLegalMoves(r, c, board, color, lastMove, castlingRights);
          if (moves.some(m => m.row === targetRow && m.col === targetCol)) {
            list.push({ row: r, col: c });
          }
        }
      }
    }
    return list;
  };

  // Desambiguación (solo para piezas que no sean peones)
  let disambiguation = '';
  if (piece.type !== 'pawn') {
    const ambiguous = findAmbiguous(piece.type, piece.color,
                                    move.toRow, move.toCol,
                                    move.fromRow, move.fromCol);

    if (ambiguous.length > 0) {
      const sameFile = ambiguous.some(p => p.col === move.fromCol);
      const sameRank = ambiguous.some(p => p.row === move.fromRow);

      if (!sameFile) {
        disambiguation = files[move.fromCol];
      } else if (!sameRank) {
        disambiguation = (8 - move.fromRow).toString();
      } else {
        disambiguation = from; // ambas coordenadas
      }
    }
  }

  // Construcción de la notación base
  let notation = pieceLetter + disambiguation;

  if (piece.type === 'pawn') {
    if (isCapture) {
      notation = files[move.fromCol] + 'x' + to; // siempre file origen en captura de peón
    } else {
      notation = to;
    }
  } else {
    if (isCapture) notation += 'x';
    notation += to;
  }

  // Promoción
  if (move.moveData?.promotion) {
    const promoLetter = {
      queen:  'Q',
      rook:   'R',
      bishop: 'B',
      knight: 'N'
    }[move.moveData.promotion];
    notation += '=' + promoLetter;
  }

  // Jaque y jaque mate
  const opponentColor = piece.color === 'white' ? 'black' : 'white';
  const castlingCopy = { ...castlingRights };

  // Simulamos el movimiento
  const backup = makeTempMove(
    board,
    castlingCopy,
    move.fromRow,
    move.fromCol,
    move.toRow,
    move.toCol,
    !!move.moveData?.enPassant
  );

  const check = isInCheck(board, opponentColor);
  const stalemate = !hasLegalMoves(board, opponentColor, lastMove, castlingRights);

  if (check) {
    notation += stalemate ? '#' : '+';
  }

  // Deshacemos la simulación
  undoTempMove(board, castlingCopy, move.fromRow, move.fromCol, move.toRow, move.toCol, backup);

  return notation;
}