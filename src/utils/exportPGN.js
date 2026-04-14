const getPgnResult = (winner) => {
	if (winner === 'draw') return '1/2-1/2';
	if (winner === 'white') return '1-0';
	if (winner === 'black') return '0-1';
	return '*';
};

const buildPgnMovetext = (moves = []) => {
	let pgnMoves = '';

	for (let i = 0; i < moves.length; i += 1) {
		if (i % 2 === 0) {
			pgnMoves += `${Math.floor(i / 2) + 1}. `;
		}

		pgnMoves += `${moves[i]} `;
	}

	return pgnMoves.trim();
};

const formatDateTag = (value) => {
	const date = value ? new Date(value) : new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}.${month}.${day}`;
};

const buildPgnText = (match) => {
	const result = getPgnResult(match.winner);
	const whitePlayer = match.playerColor === 'white' ? 'Jugador' : 'Stockfish';
	const blackPlayer = match.playerColor === 'black' ? 'Jugador' : 'Stockfish';
	const dateTag = formatDateTag(match.createdAt);
	const moveText = buildPgnMovetext(match.moveHistory || []);

	const tags = [
		`[Event "ChessTeacher Match"]`,
		`[Site "ChessTeacher"]`,
		`[Date "${dateTag}"]`,
		`[Round "-"]`,
		`[White "${whitePlayer}"]`,
		`[Black "${blackPlayer}"]`,
		`[Result "${result}"]`,
	];

	return `${tags.join('\n')}\n\n${moveText} ${result}`.trim();
};

const downloadPgnFile = (match, pgnText) => {
	const blob = new Blob([pgnText], { type: 'application/x-chess-pgn;charset=utf-8' });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement('a');
	const dateForName = formatDateTag(match.createdAt).replace(/\./g, '-');

	link.href = url;
	link.download = `partida-${dateForName}-${match.id || 'chessteacher'}.pgn`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
};

export const exportMatchAsPGN = (match) => {
	const pgnText = buildPgnText(match);
	downloadPgnFile(match, pgnText);
	return pgnText;
};