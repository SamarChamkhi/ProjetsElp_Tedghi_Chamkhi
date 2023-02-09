package main

import (
	"bufio"
	"fmt"
	"net"
	"os"
	"regexp"
	"strings"
)

func main() {

	arguments := os.Args
	if len(arguments) == 1 {
		fmt.Println("Please provide host:port.")
		return
	}

	CONNECT := arguments[1]
	c, err := net.Dial("tcp", CONNECT)
	if err != nil {
		fmt.Println(err)
		return
	}
	go readConnection(c)
	for {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("")
		text, _ := reader.ReadString('\n')
		fmt.Fprintf(c, text+"\n")
		if strings.TrimSpace(string(text)) == "STOP" {
			fmt.Println("Exiting TCP server!")
			return
		}
	}
}

func readConnection(conn net.Conn) {
	scanner := bufio.NewScanner(conn)
	for scanner.Scan() {
		text := scanner.Text()
		command := handleCommands(text, conn)
		if !command {
			fmt.Println("", text)
		}
	}
	fmt.Println("Reached EOF on server connection.")
}
func handleCommands(text string, conn net.Conn) bool {
	r, _ := regexp.Compile("^%.*%$")
	if r.MatchString(text) {

		switch text {
		case "%quit%":
			//fmt.Println("Server is leaving. Hanging up.")
			conn.Close()
			return true
		}

		return true
	}

	return false
}
