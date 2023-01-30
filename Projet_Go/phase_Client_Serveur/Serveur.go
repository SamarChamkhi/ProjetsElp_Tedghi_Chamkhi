package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"strconv"
	"strings"
	"sync"
)

var count = 0

type CaseACal struct {
	colonne []int
	ligne   []int
	x       int
	y       int
}
type caseCalcule struct {
	indiceLigne   int
	indiceColonne int
	resultat      int
}

func main() {
	arguments := os.Args
	if len(arguments) == 1 {
		fmt.Println("Please provide a port number!")
		return
	}

	PORT := ":" + arguments[1]
	l, err := net.Listen("tcp4", PORT)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer l.Close()

	for {
		c, err := l.Accept()
		if err != nil {
			fmt.Println(err)
			return
		}
		go handleConnection(c)
		count++
	}
}
func handleConnection(c net.Conn) {
	fmt.Print(".")
	for {
		netData, err := bufio.NewReader(c).ReadString('\n')
		if err != nil {
			fmt.Println(err)
			return
		}

		temp := strings.TrimSpace(string(netData))
		if temp == "STOP" {
			c.Write([]byte("%quit%"))
			c.Close()
			break
		}

		var matriceA [][]int
		var matriceB [][]int
		var errA, errB error
		var wg sync.WaitGroup

		// on éxécute deux fonction go qui lisent les matrices
		wg.Add(2)

		// lecture de la matrice a
		go func() {
			matriceA, errA = lireMatrice("matrice_a.txt")
			if errA != nil {
				fmt.Println(errA)
			}
			wg.Done()
		}()

		// lecture de la matrice b
		go func() {
			matriceB, errB = lireMatrice("matrice_b.txt")
			if errB != nil {
				fmt.Println(errB)
			}
			wg.Done()
		}()

		// Si on essaie d'afficher les matrices avant wg.wait(),
		// on obtient des matrices vides
		wg.Wait()
		fmt.Println("Les waitgroupes ont fini")
		// Affichage des matrices
		c.Write([]byte("------------- La matrice A -------------\n"))
		fmt.Println("------------- La matrice A -------------\n")
		affichageMatrice(matriceA, c)
		c.Write([]byte("\n"))
		fmt.Println("------------- La matrice B -------------\n")
		c.Write([]byte("------------- La matrice B -------------\n"))
		affichageMatrice(matriceB, c)

		// Vérification si le produit matriciel est possible il passe,
		// sinon Exit
		if len(matriceA[0]) != len(matriceB) {
			fmt.Println("Produit Matriciel Impossible \n")
			c.Write([]byte("Produit Matriciel Impossible \n"))
			os.Exit(1)
		} else {
			fmt.Println("Produit Matriciel possible\n ")
			c.Write([]byte("Produit Matriciel possible \n"))

		}
		// Initialisation de la matrice Produit
		matriceProduit := make([][]int, len(matriceA))
		for j := range matriceProduit {
			matriceProduit[j] = make([]int, len(matriceB[0]))
		}

		var i, k int
		CaseToCalcul := make(chan CaseACal)
		CaseResultat := make(chan caseCalcule)
		var NombreCase = len(matriceA) * len(matriceB[0])

		go RemplirCanal(NombreCase, &CaseToCalcul, matriceA, matriceB) // prend les canaux où on a poussé les cases
		// Lancement des goroutines pour calculer les cases dans le problème et les pushs dans un autre canal
		for k = 0; k < 5; k++ {
			go calculUneCase(CaseToCalcul, CaseResultat)
		}
		// On récupère le résultat de matriceProduit avec la fonction produitMatriciel
		//matriceProduit = produitMatriciel(matriceA, matriceB)
		for i = 0; i < NombreCase; i++ {
			for case2 := range CaseResultat {
				matriceProduit[case2.indiceLigne][case2.indiceColonne] = case2.resultat
			}
		}

		//Affichage de la matrice Produit
		fmt.Println("------------- La matrice Produit -------------\n")
		c.Write([]byte("------------- La matrice Produit -------------\n"))
		affichageMatrice(matriceProduit, c)

	}
	c.Close()
}

// fonction pour lire une matrice à partir d'un fichier
// retiurne la matrice sinon erreur en cas de problème
func lireMatrice(nomFichier string) ([][]int, error) {
	// Ouvrir le fichier en lecture
	file, err := os.Open(nomFichier)
	if err != nil {
		panic(err)
	}
	defer file.Close()
	// Créer un nouveau scanner pour lire les lignes du fichier
	scanner := bufio.NewScanner(file)
	// Lire les lignes du fichier
	var matrice [][]int
	for scanner.Scan() {
		line := scanner.Text()
		row := strings.Split(line, " ")
		var intLine []int
		// convertir chaque élément de la ligne et le stocker dans intLine
		for _, element := range row {
			num, err := strconv.Atoi(element)
			if err != nil {
				panic(err)
			}
			intLine = append(intLine, num)
		}
		matrice = append(matrice, intLine)
	}
	// Vérifier si une erreur s'est produite en cours de lecture
	if err := scanner.Err(); err != nil {
		panic(err)
	}
	return matrice, err
}

// Fonction qui fait le produit Matriciel de A et B
/*func produitMatriciel(a [][]int, b [][]int) [][]int {
	var i, k int
	CaseToCalcul := make(chan CaseACal, 5)
	CaseResultat := make(chan caseCalcule, 5)
	var NombreCase = len(a) * len(b[0])
	var CasesProbleme = make([]CaseACal, NombreCase)

	matriceRes := make([][]int, len(a))

	for j := range matriceRes {
		matriceRes[j] = make([]int, len(b[0]))
	}
	for i = 0; i < len(b[0]); i++ {
		// on récupère i-ème la colonne de la matrice B
		col := make([]int, len(b))
		col = Inversion(b, i)
		for k = 0; k < len(a); k++ {
			// pour chaque ligne on effectue le calcul d'une case avec la go function
			for j := 0; j < NombreCase; j++ {
				CasesProbleme[j].colonne = col[:]
				CasesProbleme[j].ligne = a[k][:]
				CasesProbleme[j].x = k
				CasesProbleme[j].y = i
			}
		}
	}
		go RemplirCanal(NombreCase, &CaseToCalcul, &CasesProbleme) // prend les canaux où on a poussé les cases
	// Lancement des goroutines pour calculer les cases dans le problème et les pushs dans un autre canal
	for k = 0; k < 5; k++ {
		go calculUneCase(CaseToCalcul, CaseResultat)
	}
	return matriceRes
}*/
func RemplirCanal(y int, canal *chan CaseACal, a [][]int, b [][]int) {
	var NombreCase = len(a) * len(b[0])
	var j = 0
	for i := 0; i < len(b[0]); i++ {
		// on récupère i-ème la colonne de la matrice B
		col := make([]int, len(b))
		col = Inversion(b, i)
		for k := 0; k < len(a); k++ {
			// pour chaque ligne on effectue le calcul d'une case avec la go function
			for j < NombreCase {
				var CasesProbleme CaseACal
				CasesProbleme.colonne = col[:]
				CasesProbleme.ligne = a[k][:]
				CasesProbleme.x = k
				CasesProbleme.y = i
				*canal <- CasesProbleme
				j++
			}
		}
	}

}

// Fonction pour calculer une case de la matrice produit

func calculUneCase(canal1 chan CaseACal, canal2 chan caseCalcule) {
	for case1 := range canal1 {
		var CaseRes caseCalcule
		CaseRes.indiceLigne = case1.x
		CaseRes.indiceColonne = case1.y
		var somme = 0
		for i := 0; i < len(case1.colonne); i++ {
			somme += case1.colonne[i] * case1.ligne[i]
		}
		CaseRes.resultat = somme
		canal2 <- CaseRes
	}

}

// Fonction qui prend une matrice et un indice
// et retourne la colonne d'indice indice
func Inversion(c [][]int, indice int) []int {
	res := make([]int, len(c))
	for i := 0; i < len(c); i++ {
		res[i] = c[i][indice]
	}
	return res
}

// Fonction Affichage de matrice
func affichageMatrice(matrice [][]int, c net.Conn) {
	for i := 0; i < len(matrice); i++ {
		for j := 0; j < len(matrice[i]); j++ {
			res := strconv.Itoa(matrice[i][j]) + "\t"
			c.Write([]byte(res))
		}
		res1 := " \n"
		c.Write([]byte(res1))
	}
}
