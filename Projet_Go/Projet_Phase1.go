package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"sync"
)

func main() {

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
	fmt.Println("------------- La matrice A -------------")
	affichageMatrice(matriceA)
	fmt.Println("------------- La matrice B -------------")
	affichageMatrice(matriceB)

	// Vérification si le produit matriciel est possible il passe,
	// sinon Exit
	if len(matriceA[0]) != len(matriceB) {
		fmt.Println("Produit Matriciel Impossible ")
		os.Exit(1)
	} else {
		fmt.Println("Produit Matriciel possible ")
	}

	// Initialisation de la matrice Produit
	matriceProduit := make([][]int, len(matriceA))
	for j := range matriceProduit {
		matriceProduit[j] = make([]int, len(matriceB[0]))
	}
	// On récupère le résultat de matriceProduit avec la fonction produitMatriciel
	matriceProduit = produitMatriciel(matriceA, matriceB)

	//Affichage de la matrice Produit
	fmt.Println("------------- La matrice Produit -------------")
	affichageMatrice(matriceProduit)

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
func produitMatriciel(a [][]int, b [][]int) [][]int {
	var i, k int
	canalInt := make(chan int)
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
			go calculUneCase(a[k][:], col[:], len(b), canalInt)
			matriceRes[k][i] = <-canalInt
			/*fmt.Print("Le nouveau terme calculé est :")
			fmt.Println(matriceProduit[k][i])
			fmt.Print("\n")*/
		}
	}
	return matriceRes
}

// Fonction pour calculer une case de la matrice produit
func calculUneCase(c []int, l []int, taille int, a chan int) {
	var res int
	res = 0
	for i := 0; i < taille; i++ {
		res += c[i] * l[i]
	}
	a <- res
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
func affichageMatrice(matrice [][]int) {
	for i := 0; i < len(matrice); i++ {
		for j := 0; j < len(matrice[i]); j++ {
			fmt.Print(matrice[i][j], "\t")
		}
		fmt.Println()
	}
}
