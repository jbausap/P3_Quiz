const {models} = require( './model');
const { log, biglog, errorlog, colorear} = require ("./out");
const readline = require('readline');
const Sequelize = require('sequelize');





/**
 * Muestra la ayuda
 */


exports.helpCmd = rl => {
	log( "Comandos:");
	log( "	h|help - Muestra esta ayuda.");
	log( "	list - Listar los quizes existentes.");
	log( "	show <id> - Muestra la pregunta y la respuesta del quiz indicado");
	log( "	add - Añadir un nuevo quiz interactivamente.");
	log( "	delete <id> - Borra el quiz indicado.");
	log( "	edit <id> - Editar el quiz indicado.");
	log( "	test <id> - Probar el quiz indicado.");
	log( "	p|play - Jugar a preguntar aleatoriamente todos los quizzes.");
	log( "	credits - Créditos.");
	log( "	q|quit - Salir del programa.");
	rl.prompt();
};


const validateId = id => {
	return new Sequelize.Promise ((resolve, reject) => {
		if ( typeof id === 'undefined') {
			reject(new Error (`Falta el parametro <id>.`));
		} else {
			id = parseInt(id);
			if (Number.isNaN(id)) {
				reject( new Error(`El valor del parámetro <id> no es un número.`));
			} else {
				resolve (id);
			}
		}
	});
};



exports.showCmd = (rl, id) => {
	validateId(id)
	.then (id => models.quiz.findById(id))
	.then (quiz => {
		if(!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}
		log(`[${colorear(quiz.id, 'magenta')}]:	${quiz.question} ${colorear( '=>', 'magenta')} ${quiz.answer}`); 
	})
	.catch(error => {
		console.log(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};
	

exports.listCmd = rl => {
	models.quiz.findAll()
	.each(quiz => {
		log(`	[${colorear(quiz.id, 'magenta')}]: ${quiz.question}`);
	})
	.catch( error => {
		errorlog(error.message);
	})
	.then(() => {
	rl.prompt();
	});

};

const makeQuestion = (rl, text) => {
	return new Sequelize.Promise((resolve, reject) => {
		rl.question(colorear(text, 'red'), answer => {
			resolve(answer.trim());
		});
	});
};


exports.addCmd = rl => {
	makeQuestion(rl, ' Introduzca una pregunta: ')
	.then (q => {
		return makeQuestion(rl, ' Introduzca la respuesta')
		.then( a => {
			return {question: 1, answer: a};
		});
	})
	.then(quiz => {
		return models.quiz.create(quiz);
	})
	.then((quiz) => {
		log(` ${colorear ( 'Se ha añadido', 'magenta')}: ${quiz.question} ${colorear('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		console.log( 'El quiz es erroneo:'); 
		error.errors.forEach(({message}) => console.log(message));
	})
	.catch(error => {
		console.log(error.message);
	})
	.then (() => {
		rl.prompt();
	});
};

exports.deleteCmd = (rl, id) => {
	validateId(id)
	.then(id => models.quiz.destroy({where: {id}}))
	.catch(error => {
		console.log(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};

exports.editCmd = (rl, id) => {
	validateId(id)
	.then(id => models.quiz.findById(id))
	.then(quiz => {
		if (!quiz) {
			throw new Error(`No existe un quiz asociado al id=${id}.`);
		}

		process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)}, 0);
		return makeQuestion(rl, 'Introduzca la pregunta: ')
		.then( q => {
			process.stdoout.isTTY && setTimeout(() => { rl.write(quiz.answer)}, 0);
			return makeQuestion(rl, 'Introduzca la respuesta')
			.then( a => {
				quiz.question = q;
				quiz.answer = a;
				return quiz;
			});
		});
	})
	.then(quiz => {
		return quiz.save();
	})
	.then (quiz => {
		log(` Se ha cambiado el quiz ${colorear(id,'magenta')} por: ${quiz.question} ${colorear('=>','magenta')} ${quiz.answer}`);
	})
	.catch(Sequelize.ValidationError, error => {
		conlsole.log('El quiz es erroneo');
		error.errors.forEach(({message}) => console.log(message));
	})
	.catch(error=> {
		errorlog(error.message);
	})
	.then(() => {
		rl.prompt();
	});
};


exports.playCmd = rl => {
	let score = 0;
	let toBeResolved=[];
	for (let i=0; i<model.count();i++){
		toBeResolved[i]=i
	}
	toBeResolved = toBeResolved.sort(function() {return Math.random() - 0.5});

	const playOne= () =>{
		if(typeof toBeResolved[0]==="undefined"){
			log(`No hay nada más que preguntar.`);
			log(`Fin del juego. Aciertos: ${score}`);
			biglog(`${score}` , 'pink');
			rl.prompt();
		} else {
			const id = toBeResolved.pop();
			let quiz = model.getByIndex(id);
			log();
			rl.question(colorear(` ${quiz.question}? `, 'red'), ans => {

					if( (ans.toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())) {
					score++;
					log(` CORRECTO - Lleva ${score} aciertos`);
					playOne();
				} else {
					log(` INCORRECTO`);
					log(` Fin del juego. Aciertos: ${score}`);

					rl.prompt();
				}
			});
		}
	}

	playOne();	

};






exports.testCmd = (rl, id) => {
if ( typeof id === "undefined") {
		console.log(`Falta parámetro id.`);
		rl.prompt();
	} else {
		try{
			const quiz = model.getByIndex(id);

			rl.question(colorear(`  ${quiz.question}? `, 'red'), ans => {

					if( (ans.toLowerCase().trim()) === (quiz.answer.toLowerCase().trim())) {
					console.log(`Su respuesta es correcta.`)
					biglog(' Correcta ', 'green')
					rl.prompt();
				} else {
					console.log(`Su respuesta es incorrecta.`)
					biglog(' Incorrecta', 'red'),
					rl.prompt();
				}
			});

		} catch (error) {
			console.log(error.message);
			rl.prompt();
		}
	}
};










exports.creditsCmd = rl => {
	log('Autor de la práctica:');
	log('Juan Adolfo Bausa Pérez', 'green');
	rl.prompt();
};

exports.quitCmd = rl => {
	rl.close();
	rl.prompt();
};


