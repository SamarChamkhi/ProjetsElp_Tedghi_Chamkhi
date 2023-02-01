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

type caseCalculation struct {
	colonne []int
	ligne   []int
	x       int
	y       int
}
type caseResult struct {
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
		c.Write([]byte("Est ce que vous voulez Le Résultat du produit Matriciel\n"))

		netData, err := bufio.NewReader(c).ReadString('\n')
		if err != nil {
			fmt.Println(err)
			return
		}
		temp := strings.TrimSpace(string(netData))
		if temp == "non" {
			continue
		}
		if temp == "STOP" {
			c.Write([]byte("%quit%"))
			c.Close()
			break
		}
		if temp == "oui" {
			c.Write([]byte("-------Affichage--------\n"))
		}
		var matriceA [][]int
		var matriceB [][]int
		var errA, errB error
		var wg sync.WaitGroup
		var i, k = 0, 0
		CaseToCalcul := make(chan caseCalculation)
		CaseResultat := make(chan caseResult)
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
		var NombreCase = len(matriceProduit) * len(matriceProduit[0])

		// Remplir le canal avec les cases à calculer
		go RemplirCanal(NombreCase, &CaseToCalcul, matriceA, matriceB)

		// Lancement des goroutines pour calculer les cases dans le canalToCalcul
		// et les pushs dans un autre canal Résultat
		for k = 0; k < 5; k++ {
			go calculUneCase(CaseToCalcul, CaseResultat)
		}

		// On récupère les cases calculées du canalRésultat
		// et on les place dans la bonne position de la matriceProduit
		for i < NombreCase {
			case2, ok := <-CaseResultat
			if ok {
				matriceProduit[case2.indiceLigne][case2.indiceColonne] = case2.resultat
				i++
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

func RemplirCanal(y int, canal *chan caseCalculation, a [][]int, b [][]int) {
	for i := 0; i < len(b[0]); i++ {
		// on récupère i-ème la colonne de la matrice B
		col := make([]int, len(b))
		col = Inversion(b, i)
		for k := 0; k < len(a); k++ {
			// pour chaque ligne on effectue le calcul d'une case avec la go function
			var CasesProbleme caseCalculation
			CasesProbleme.colonne = col[:]
			CasesProbleme.ligne = a[k][:]
			CasesProbleme.x = k
			CasesProbleme.y = i
			*canal <- CasesProbleme
		}
	}

}

// Fonction pour calculer une case de la matrice produit
func calculUneCase(canal1 chan caseCalculation, canal2 chan caseResult) {
	for case1 := range canal1 {
		var CaseRes caseResult
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
